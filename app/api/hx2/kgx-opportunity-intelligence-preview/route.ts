import { NextResponse } from "next/server";
import { buildKgxOpportunityIntelligence } from "../_lib/kgx-opportunity-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const opportunities =
    await buildKgxOpportunityIntelligence();

  return NextResponse.json({
    ok: true,
    opportunity_intelligence_active: true,
    opportunities
  });
}
