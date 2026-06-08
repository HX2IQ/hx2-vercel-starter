import { NextResponse } from "next/server";
import { persistKgxContextualPipelineMemory } from "../_lib/kgx-contextual-pipeline-memory";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const capabilityPlanId =
      body?.capabilityPlanId ||
      body?.capability_plan_id ||
      "";

    const requestText =
      body?.requestText ||
      body?.request_text ||
      "";

    const pipeline =
      Array.isArray(body?.pipeline)
        ? body.pipeline
        : [];

    if (!capabilityPlanId || !requestText) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing capabilityPlanId or requestText"
        },
        { status: 400 }
      );
    }

    const result =
      await persistKgxContextualPipelineMemory(
        capabilityPlanId,
        requestText,
        pipeline
      );

    return NextResponse.json({
      ok: true,
      kgx_contextual_pipeline_memory_active: true,
      result
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "contextual pipeline write failed"
      },
      { status: 500 }
    );
  }
}
