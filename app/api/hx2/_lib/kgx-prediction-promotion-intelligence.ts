import { buildKgxPredictionReadinessAttribution } from "./kgx-prediction-readiness-attribution";

export async function buildKgxPredictionPromotionIntelligence(
  requestText: string
) {
  const attribution =
    await buildKgxPredictionReadinessAttribution(requestText);

  const promotionEligible =
    attribution.ready &&
    attribution.failed_factors === 0;

  return {
    prediction_promotion_intelligence_active: true,
    request: requestText,
    promotion_eligible: promotionEligible,
    promotion_band:
      promotionEligible
        ? "promote"
        : attribution.passed_factors >= 2
          ? "hold"
          : "block",
    reason:
      promotionEligible
        ? "prediction passed readiness attribution gates"
        : "prediction did not pass all readiness attribution gates",
    attribution
  };
}
