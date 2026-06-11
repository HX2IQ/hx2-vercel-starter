export function buildKgxPredictionPromotionAuditTrail(
  promotion: any,
  trace: any[]
) {
  return {
    prediction_promotion_audit_trail_active: true,
    promotion_band:
      promotion?.promotion_band || "unknown",
    promotion_eligible:
      Boolean(promotion?.promotion_eligible),
    trace_count: trace.length,
    trace
  };
}
