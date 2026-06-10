import { NextResponse } from "next/server";
import { buildKgxPredictionTrustExplanation } from "../_lib/kgx-prediction-trust-explanation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const explanation =
    await buildKgxPredictionTrustExplanation(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_trust_explanation_active: true,
    explanation
  });
}
