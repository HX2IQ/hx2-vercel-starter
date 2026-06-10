import { NextResponse } from "next/server";
import { buildKgxPredictionFailureCauseConsumption } from "../_lib/kgx-prediction-failure-cause-consumption";

export const dynamic = "force-dynamic";

export async function GET() {
  const consumption =
    await buildKgxPredictionFailureCauseConsumption();

  return NextResponse.json({
    ok: true,
    kgx_prediction_failure_cause_consumption_active: true,
    consumption
  });
}
