import { NextResponse } from "next/server";
import { buildKgxUnifiedCalibrationEngine } from "../_lib/kgx-unified-calibration-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const calibration =
    await buildKgxUnifiedCalibrationEngine();

  return NextResponse.json({
    ok: true,
    kgx_unified_calibration_engine_active: true,
    calibration
  });
}
