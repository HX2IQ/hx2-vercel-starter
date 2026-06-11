import { NextResponse } from "next/server";
import { buildKgxDecisionConfidenceIntelligence } from "../_lib/kgx-decision-confidence-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const confidence =
    await buildKgxDecisionConfidenceIntelligence();

  return NextResponse.json({
    ok: true,
    decision_confidence_intelligence_active: true,
    confidence
  });
}
