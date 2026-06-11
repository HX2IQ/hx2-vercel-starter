import { NextResponse } from "next/server";
import { buildKgxRiskScenarioIntelligence } from "../_lib/kgx-risk-scenario-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const risk =
    await buildKgxRiskScenarioIntelligence();

  return NextResponse.json({
    ok: true,
    risk_scenario_intelligence_active: true,
    risk
  });
}
