import { NextResponse } from "next/server";
import { buildKgxRoutingDecisionOutcomeAttribution } from "../_lib/kgx-routing-decision-outcome-attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  const attribution =
    await buildKgxRoutingDecisionOutcomeAttribution();

  return NextResponse.json({
    ok: true,
    kgx_routing_decision_outcome_attribution_active: true,
    attribution
  });
}
