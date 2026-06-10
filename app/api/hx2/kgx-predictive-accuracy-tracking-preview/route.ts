import { NextResponse } from "next/server";
import { buildKgxPredictiveAccuracyTracking } from "../_lib/kgx-predictive-accuracy-tracking";

export const dynamic = "force-dynamic";

export async function GET() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  return NextResponse.json({
    ok: true,
    kgx_predictive_accuracy_tracking_active: true,
    tracking
  });
}
