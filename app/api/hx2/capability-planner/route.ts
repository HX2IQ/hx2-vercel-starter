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

    const result = buildCapabilityPlan(userRequest);

    const savedPlan = await prisma.capabilityPlan.create({
      data: {
        requestText: userRequest,
        plannerOutput: result as any
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_capability_plan_persisted",
        eventSource: "api/hx2/capability-planner",
        payload: {
          capability_plan_id: savedPlan.id,
          request_text: userRequest
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_plan_persistence_active: true,
      plan: result,
      persisted: {
        capabilityPlan: savedPlan,
        audit
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        kgx_plan_persistence_active: false,
        error: err?.message || "planner failure"
      },
      { status: 500 }
    );
  }
}
