import { NextResponse } from "next/server";
import { writeKgxPipelineOutcome } from "../_lib/kgx-pipeline-outcome";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const capabilityPlanId =
      body?.capabilityPlanId ||
      body?.capability_plan_id ||
      "";

    if (!capabilityPlanId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing capabilityPlanId"
        },
        { status: 400 }
      );
    }

    const pipeline =
      Array.isArray(body?.pipeline)
        ? body.pipeline
        : [];

    const contextTags =
      Array.isArray(body?.context_tags)
        ? body.context_tags
        : Array.isArray(body?.contextTags)
          ? body.contextTags
          : [];

    const result = await writeKgxPipelineOutcome(
      capabilityPlanId,
      !!body?.success,
      Number(body?.score ?? 0),
      body?.notes,
      pipeline,
      contextTags
    );

    return NextResponse.json({
      ok: true,
      kgx_pipeline_outcome_feedback_active: true,
      kgx_node_outcome_attribution_active: true,
      outcome: result
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "pipeline outcome failed"
      },
      { status: 500 }
    );
  }
}

