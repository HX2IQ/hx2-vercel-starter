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
        {
          ok: false,
          error: "Missing planner input"
        },
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
        plan_count: recentPlans.length,
        recent_memory_keys: recentMemories.map(x => x.memoryKey),
        recent_requests: recentPlans.map(x => x.requestText)
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
          requestText: userRequest,
          selected_node: (enhancedResult as any)?.selected_node || null,
          intent: (enhancedResult as any)?.intent || null,
          execution_mode: (enhancedResult as any)?.execution_mode || null,
          confidence: (enhancedResult as any)?.confidence || null,
          capability_plan_id: savedPlan.id,
          kgx_stage: "KGX-I"
        }
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_planner_memory_created",
        eventSource: "api/hx2/capability-planner",
        payload: {
          capability_plan_id: savedPlan.id,
          memory_id: memory.id,
          memory_key: memory.memoryKey,
          memory_count_before: recentMemories.length,
          plan_count_before: recentPlans.length
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_recall_planner_active: true,
      kgx_automatic_planner_memory_active: true,
      plan: enhancedResult,
      persisted: {
        capabilityPlan: savedPlan,
        memory,
        audit
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
