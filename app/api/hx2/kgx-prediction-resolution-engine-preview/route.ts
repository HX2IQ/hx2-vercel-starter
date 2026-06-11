import { NextResponse } from "next/server";
import { buildKgxPredictionResolutionEngine } from "../_lib/kgx-prediction-resolution-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const resolution =
    await buildKgxPredictionResolutionEngine();

  return NextResponse.json({
    ok: true,
    prediction_resolution_engine_active: true,
    resolution
  });
}
