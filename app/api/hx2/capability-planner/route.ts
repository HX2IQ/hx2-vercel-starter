import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";
import { prisma } from "../_lib/kgx-lite";
import { buildKgxGraphContext } from "../_lib/kgx-context-builder";
import { buildKgxPlannerInfluence } from "../_lib/kgx-planner-influence";
import { buildKgxExecutionLearning } from "../_lib/kgx-execution-learning";
import { buildKgxNodeEffectiveness } from "../_lib/kgx-node-effectiveness";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userRequest =
      body?.message ||
      body?.text ||
      body?.input ||
      "";

    if (!userRequest) {
      return NextResponse.json(
        { ok: false, error: "Missing planner input" },
        { status: 400 }
      );
    }

    const graphContext = await buildKgxGraphContext(userRequest);

const executionLearning =
  await buildKgxExecutionLearning();

const nodeEffectiveness =
  await buildKgxNodeEffectiveness();

const plannerInfluence =
  await buildKgxPlannerInfluence(
    userRequest
  );

    const result = buildCapabilityPlan(userRequest);

    const enhancedResult = {
      ...result,
      kgx_phase_2a_graph_intelligence_active: true,
      kgx_graph_context: graphContext,
kgx_planner_influence: plannerInfluence,
kgx_execution_learning: executionLearning,
kgx_node_effectiveness: nodeEffectiveness
    };

    const savedPlan = await prisma.capabilityPlan.create({
      data: {
        requestText: userRequest,
        plannerOutput: enhancedResult as any
      }
    });

    const memory = await prisma.memoryRecord.create({
      data: {
        memoryType: "graph_aware_capability_plan",
        memoryKey: `graph_aware_capability_plan_${savedPlan.id}`,
        payload: {
          capability_plan_id: savedPlan.id,
          requestText: userRequest,
          graph_summary: graphContext.summary
        }
      }
    });

    await prisma.kgxRelationship.create({
      data: {
        sourceType: "Node",
        sourceId: "HX2",
        relationType: "generated_graph_aware_plan",
        targetType: "CapabilityPlan",
        targetId: savedPlan.id,
        payload: {
          requestText: userRequest,
          ranked_context_count: graphContext.summary.ranked_items
        }
      }
    });

    await prisma.kgxRelationship.create({
      data: {
        sourceType: "CapabilityPlan",
        sourceId: savedPlan.id,
        relationType: "created_graph_memory",
        targetType: "MemoryRecord",
        targetId: memory.id,
        payload: {
          memoryKey: memory.memoryKey
        }
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_phase_2a_graph_intelligence_plan",
        eventSource: "api/hx2/capability-planner",
        payload: {
          capability_plan_id: savedPlan.id,
          memory_id: memory.id,
          ranked_context_count: graphContext.summary.ranked_items
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_phase_2a_graph_intelligence_active: true,
      plan: enhancedResult,
      persisted: {
        capabilityPlan: savedPlan.id,
        memory: memory.id,
        audit: audit.id
      }
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "planner failure"
      },
      { status: 500 }
    );
  }
}



