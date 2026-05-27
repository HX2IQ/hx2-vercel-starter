import { NextResponse } from "next/server";
import { getPhase3BRouteContractSummary } from "../_lib/phase3b-route-contract-summary";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BRouteContractSummary();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-route-contract-summary",
  });
}
