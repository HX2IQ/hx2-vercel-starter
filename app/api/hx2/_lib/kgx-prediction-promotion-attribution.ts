import { buildKgxPredictionPromotionIntelligence } from "./kgx-prediction-promotion-intelligence";

export async function buildKgxPredictionPromotionAttribution(
  requestText: string
) {
  const promotion =
    await buildKgxPredictionPromotionIntelligence(requestText);

  const factors = [
    {
      factor: "promotion_eligible",
      value: promotion.promotion_eligible
    },
    {
      factor: "promotion_band",
      value: promotion.promotion_band
    },
    {
      factor: "ready",
      value: promotion.attribution.ready
    },
    {
      factor: "passed_factors",
      value: promotion.attribution.passed_factors
    }
  ];

  return {
    prediction_promotion_attribution_active: true,
    request: requestText,
    promotion_eligible: promotion.promotion_eligible,
    promotion_band: promotion.promotion_band,
    factors
  };
}
