import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionExplanation } from "../_lib/kgx-prediction-promotion-explanation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const explanation =
    await buildKgxPredictionPromotionExplanation(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_explanation_active: true,
    explanation
  });
}
