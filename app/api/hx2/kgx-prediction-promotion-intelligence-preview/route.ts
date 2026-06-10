import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionIntelligence } from "../_lib/kgx-prediction-promotion-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const promotion =
    await buildKgxPredictionPromotionIntelligence(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_intelligence_active: true,
    promotion
  });
}
