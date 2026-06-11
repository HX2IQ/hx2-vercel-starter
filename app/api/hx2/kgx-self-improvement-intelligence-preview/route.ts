import { NextResponse } from "next/server";
import { buildKgxSelfImprovementIntelligence } from "../_lib/kgx-self-improvement-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const improvement =
    await buildKgxSelfImprovementIntelligence();

  return NextResponse.json({
    ok: true,
    self_improvement_intelligence_active: true,
    improvement
  });
}
