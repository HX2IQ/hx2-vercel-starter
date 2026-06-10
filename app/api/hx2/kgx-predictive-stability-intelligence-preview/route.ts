import { NextResponse } from "next/server";
import { buildKgxPredictiveStabilityIntelligence } from "../_lib/kgx-predictive-stability-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const stability =
    await buildKgxPredictiveStabilityIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_predictive_stability_intelligence_active: true,
    stability
  });
}
