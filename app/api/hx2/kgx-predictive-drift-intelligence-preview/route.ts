import { NextResponse } from "next/server";
import { buildKgxPredictiveDriftIntelligence } from "../_lib/kgx-predictive-drift-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const drift =
    await buildKgxPredictiveDriftIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_predictive_drift_intelligence_active: true,
    drift
  });
}
