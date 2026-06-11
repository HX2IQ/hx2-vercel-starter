import { NextResponse } from "next/server";
import { buildKgxOutcomeForecastIntelligence } from "../_lib/kgx-outcome-forecast-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const forecast =
    await buildKgxOutcomeForecastIntelligence();

  return NextResponse.json({
    ok: true,
    outcome_forecast_intelligence_active: true,
    forecast
  });
}
