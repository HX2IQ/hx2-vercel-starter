import { NextResponse } from "next/server";
import { buildKgxCalibrationStatisticsEngine } from "../_lib/kgx-calibration-statistics-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const statistics =
    await buildKgxCalibrationStatisticsEngine();

  return NextResponse.json({
    ok: true,
    calibration_statistics_engine_active: true,
    statistics
  });
}
