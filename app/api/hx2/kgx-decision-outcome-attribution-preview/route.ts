import { NextResponse } from "next/server";
import { buildKgxDecisionOutcomeAttribution } from "../_lib/kgx-decision-outcome-attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  const attribution =
    await buildKgxDecisionOutcomeAttribution();

  return NextResponse.json({
    ok: true,
    decision_outcome_attribution_active: true,
    attribution
  });
}
