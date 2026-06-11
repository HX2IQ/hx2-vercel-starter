import { NextResponse } from "next/server";
import { buildKgxForecastWeightedRecommendation } from "../_lib/kgx-forecast-weighted-recommendation";

export const dynamic = "force-dynamic";

export async function GET() {
  const recommendation =
    await buildKgxForecastWeightedRecommendation();

  return NextResponse.json({
    ok: true,
    forecast_weighted_recommendation_active: true,
    recommendation
  });
}
