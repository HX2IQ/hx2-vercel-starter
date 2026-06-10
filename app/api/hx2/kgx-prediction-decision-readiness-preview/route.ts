import { NextResponse } from "next/server";
import { buildKgxPredictionDecisionReadiness } from "../_lib/kgx-prediction-decision-readiness";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const readiness =
    await buildKgxPredictionDecisionReadiness(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_decision_readiness_active: true,
    readiness
  });
}
