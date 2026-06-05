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
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    const recentPlans = await prisma.capabilityPlan.findMany({
      orderBy: {
        createdAt: "desc"
      },
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

    await prisma.auditEvent.create({
      data: {
        eventType: "kgx_planner_used_recall",
        eventSource: "api/hx2/capability-planner",
        payload: {
          capability_plan_id: savedPlan.id,
          memory_count: recentMemories.length,
          plan_count: recentPlans.length
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_recall_planner_active: true,
      plan: enhancedResult,
      persisted_plan_id: savedPlan.id
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
