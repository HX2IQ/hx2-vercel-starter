import { NextResponse } from "next/server";
import { buildKgxAdaptivePlanIntelligence } from "../_lib/kgx-adaptive-plan-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const adaptive =
    await buildKgxAdaptivePlanIntelligence();

  return NextResponse.json({
    ok: true,
    adaptive_plan_intelligence_active: true,
    adaptive
  });
}
