import { NextResponse } from "next/server";
import { buildKgxExecutionFeasibilityIntelligence } from "../_lib/kgx-execution-feasibility-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const feasibility =
    await buildKgxExecutionFeasibilityIntelligence();

  return NextResponse.json({
    ok: true,
    execution_feasibility_intelligence_active: true,
    feasibility
  });
}
