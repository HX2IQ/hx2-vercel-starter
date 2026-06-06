import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";
import { prisma } from "../_lib/kgx-lite";
import { buildKgxGraphContext } from "../_lib/kgx-context-builder";
import { buildKgxPlannerInfluence } from "../_lib/kgx-planner-influence";
import { buildKgxExecutionLearning } from "../_lib/kgx-execution-learning";
import { buildKgxNodeEffectiveness } from "../_lib/kgx-node-effectiveness";
import { buildKgxAdaptiveNodeSelection } from "../_lib/kgx-adaptive-node-selection";
import { persistKgxPipeline } from "../_lib/kgx-pipeline-persistence";

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

    const adaptiveSelection =
      await buildKgxAdaptiveNodeSelection(userRequest);

    const result = buildCapabilityPlan(userRequest);

    const enhancedResult = {
      ...result,
      kgx_phase_2a_graph_intelligence_active: true,
      kgx_graph_context: graphContext,
kgx_planner_influence: plannerInfluence,
kgx_execution_learning: executionLearning,
kgx_node_effectiveness: nodeEffectiveness,
      kgx_adaptive_selection: adaptiveSelection,
      kgx_adaptive_orchestration: adaptiveSelection.orchestration_assembly,
      kgx_primary_node: adaptiveSelection.orchestration_assembly?.primary_node,
      kgx_challenge_node: adaptiveSelection.orchestration_assembly?.challenge_node,
      kgx_validation_node: adaptiveSelection.orchestration_assembly?.validation_node,
      kgx_secondary_node: adaptiveSelection.orchestration_assembly?.secondary_node
    };

        const kgxPipeline = [
      {
        step: 1,
        role: "primary",
        node: enhancedResult.kgx_primary_node,
        action: `Execute ${enhancedResult.kgx_primary_node} as primary specialist`,
        depends_on: []
      },
      {
        step: 2,
        role: "challenge",
        node: enhancedResult.kgx_challenge_node,
        action: `Execute ${enhancedResult.kgx_challenge_node} challenge analysis`,
        depends_on: [1]
      },
      {
        step: 3,
        role: "validation",
        node: enhancedResult.kgx_validation_node,
        action: `Execute ${enhancedResult.kgx_validation_node} validation review`,
        depends_on: [1, 2]
      },
      {
        step: 4,
        role: "secondary",
        node: enhancedResult.kgx_secondary_node,
        action: `Execute ${enhancedResult.kgx_secondary_node} secondary support`,
        depends_on: [1]
      }
    ].filter(x => x.node);

    (enhancedResult as any).execution_pipeline = kgxPipeline;
    (enhancedResult as any).kgx_execution_pipeline_active = true;

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

    const pipelinePersistence = await persistKgxPipeline({
      requestText: userRequest,
      capabilityPlanId: savedPlan.id,
      pipeline: (enhancedResult as any).execution_pipeline || []
    });

    (enhancedResult as any).kgx_pipeline_persistence = {
      pipeline_persistence_active: true,
      pipeline_memory_id: pipelinePersistence.pipelineMemory.id,
      audit_id: pipelinePersistence.audit.id
    };

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
      kgx_primary_node: enhancedResult.kgx_primary_node,
      kgx_challenge_node: enhancedResult.kgx_challenge_node,
      kgx_validation_node: enhancedResult.kgx_validation_node,
      kgx_secondary_node: enhancedResult.kgx_secondary_node,
      kgx_adaptive_orchestration: enhancedResult.kgx_adaptive_orchestration,
      kgx_pipeline_persistence: (enhancedResult as any).kgx_pipeline_persistence,
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









