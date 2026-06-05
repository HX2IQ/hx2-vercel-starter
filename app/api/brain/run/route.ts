import { NextResponse } from "next/server";
import { prisma } from "../../hx2/_lib/kgx-lite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const input =
      body?.message ||
      body?.text ||
      body?.input ||
      "";

    if (!input) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing brain input"
        },
        { status: 400 }
      );
    }

    const brainResult = {
      ok: true,
      mode: "kgx_brain_memory_loop",
      input,
      response:
        "KGX-E brain memory loop captured this reasoning event for persistent memory.",
      timestamp: new Date().toISOString()
    };

    const memory = await prisma.memoryRecord.create({
      data: {
        memoryType: "brain_run",
        memoryKey: `brain_run_${Date.now()}`,
        payload: {
          input,
          result: brainResult,
          source: "api/brain/run",
          kgx_stage: "KGX-E"
        }
      }
    });

    const audit = await prisma.auditEvent.create({
      data: {
        eventType: "kgx_brain_run_persisted",
        eventSource: "api/brain/run",
        payload: {
          memory_id: memory.id,
          input_summary: input.slice(0, 240),
          kgx_stage: "KGX-E"
        }
      }
    });

    return NextResponse.json({
      ok: true,
      kgx_brain_memory_loop_active: true,
      result: brainResult,
      persisted: {
        memory,
        audit
      }
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        kgx_brain_memory_loop_active: false,
        error: err?.message || "brain run failed"
      },
      { status: 500 }
    );
  }
}
