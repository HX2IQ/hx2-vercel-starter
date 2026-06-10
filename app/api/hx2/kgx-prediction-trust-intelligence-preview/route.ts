import { NextResponse } from "next/server";
import { buildKgxPredictionTrustIntelligence } from "../_lib/kgx-prediction-trust-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const trust =
    await buildKgxPredictionTrustIntelligence(q);

  return NextResponse.json({
    ok: true,
    kgx_prediction_trust_intelligence_active: true,
    trust
  });
}
