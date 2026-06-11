import { NextResponse } from "next/server";
import { buildKgxPlanReadinessIntelligence } from "../_lib/kgx-plan-readiness-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness =
    await buildKgxPlanReadinessIntelligence();

  return NextResponse.json({
    ok: true,
    plan_readiness_intelligence_active: true,
    readiness
  });
}
