import { NextResponse } from "next/server";
import { buildKgxPredictionFailureRiskIntelligence } from "../_lib/kgx-prediction-failure-risk-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const risk =
    await buildKgxPredictionFailureRiskIntelligence(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_failure_risk_intelligence_active: true,
    risk
  });
}
