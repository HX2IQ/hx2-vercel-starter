import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionAuditTrail } from "../_lib/kgx-prediction-promotion-audit-trail";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_audit_trail_active: true,
    audit: buildKgxPredictionPromotionAuditTrail(
      {
        promotion_band: "preview",
        promotion_eligible: true
      },
      []
    )
  });
}
