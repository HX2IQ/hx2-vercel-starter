import { NextResponse } from "next/server";
import { buildKgxPredictionReadinessAttribution } from "../_lib/kgx-prediction-readiness-attribution";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const attribution =
    await buildKgxPredictionReadinessAttribution(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_readiness_attribution_active: true,
    attribution
  });
}
