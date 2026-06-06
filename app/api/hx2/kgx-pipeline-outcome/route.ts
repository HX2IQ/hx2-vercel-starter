import { NextRequest, NextResponse } from "next/server";
import { writeKgxPipelineOutcome } from "../_lib/kgx-pipeline-outcome";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await writeKgxPipelineOutcome(
      body.capabilityPlanId,
      !!body.success,
      Number(body.score ?? 0),
      body.notes
    );

    return NextResponse.json({
      ok: true,
      pipeline_outcome_feedback_active: true,
      outcome: result
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "pipeline outcome failed"
      },
      { status: 500 }
    );
  }
}
