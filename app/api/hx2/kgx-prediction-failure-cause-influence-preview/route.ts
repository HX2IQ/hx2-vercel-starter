import { NextResponse } from "next/server";
import { buildKgxPredictionFailureCauseInfluence } from "../_lib/kgx-prediction-failure-cause-influence";

export const dynamic = "force-dynamic";

export async function GET() {
  const influence =
    await buildKgxPredictionFailureCauseInfluence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_failure_cause_influence_active: true,
    influence
  });
}
