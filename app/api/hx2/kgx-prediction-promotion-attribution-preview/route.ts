import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionAttribution } from "../_lib/kgx-prediction-promotion-attribution";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const attribution =
    await buildKgxPredictionPromotionAttribution(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_attribution_active: true,
    attribution
  });
}
