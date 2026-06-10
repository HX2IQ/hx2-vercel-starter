import { NextResponse } from "next/server";
import { buildKgxPredictionTrustAttributionIntelligence } from "../_lib/kgx-prediction-trust-attribution-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") || "";

  const attribution =
    await buildKgxPredictionTrustAttributionIntelligence(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_trust_attribution_intelligence_active: true,
    attribution
  });
}
