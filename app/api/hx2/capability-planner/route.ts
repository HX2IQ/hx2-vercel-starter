import { NextResponse } from "next/server";
import { buildCapabilityPlan } from "../_lib/capability-planner";
import { prisma } from "../_lib/kgx-lite";

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

    const recentMemories = await prisma.memoryRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const recentPlans = await prisma.capabilityPlan.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const result = buildCapabilityPlan(userRequest);

    const enhancedResult = {
      ...result,
      kgx_recall_context: {
        memory_count: recentMemories.length,
        plan_count: recentPlans.length
      }
    };

    const savedPlan = await prisma.capabilityPlan.create({
      data: {
        requestText: userRequest,
        plannerOutput: enhancedResult as any
      }
    });

    const memory = await prisma.memoryRecord.create({
      data: {
        memoryType: "capability_plan",
        memoryKey: `capability_plan_${savedPlan.id}`,
        payload: {
          capability_plan_id: savedPlan.id,
          requestText: userRequest
        }
      }
    });

    await prisma.kgxRelationship.create({
      data: {
        sourceType: "Node",
        sourceId: "HX2",
        relationType: "generated",
        targetType: "CapabilityPlan",
        targetId: savedPlan.id,
        payload: {
          requestText: userRequest
        }
      }
    });

    await prisma.kgxRelationship.create({
      data: {
        sourceType: "CapabilityPlan",
        sourceId: savedPlan.id,
        relationType: "created_memory",
        targetType: "MemoryRecord",
        targetId: memory.id,
        payload: {
          memoryKey: memory.memoryKey
        }
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_auto_relationships_created",
        eventSource: "api/hx2/capability-planner",
        payload: {
          capability_plan_id: savedPlan.id,
          memory_id: memory.id
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_auto_graph_active: true,
      plan: savedPlan.id,
      memory: memory.id,
      audit: audit.id
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
