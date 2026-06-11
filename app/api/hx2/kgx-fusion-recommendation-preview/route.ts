import { NextResponse } from "next/server";
import { buildKgxFusionRecommendation } from "../_lib/kgx-fusion-recommendation";

export const dynamic = "force-dynamic";

export async function GET() {
  const recommendation =
    await buildKgxFusionRecommendation();

  return NextResponse.json({
    ok: true,
    fusion_recommendation_active: true,
    recommendation
  });
}
