import { NextResponse } from "next/server";
import { buildKgxDecisionQualityTracking } from "../_lib/kgx-decision-quality-tracking";

export const dynamic = "force-dynamic";

export async function GET() {
  const tracking =
    await buildKgxDecisionQualityTracking();

  return NextResponse.json({
    ok: true,
    decision_quality_tracking_active: true,
    tracking
  });
}
