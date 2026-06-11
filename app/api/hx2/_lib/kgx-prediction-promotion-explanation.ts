import { buildKgxPredictionPromotionIntelligence } from "./kgx-prediction-promotion-intelligence";

export async function buildKgxPredictionPromotionExplanation(
  requestText: string
) {
  const promotion =
    await buildKgxPredictionPromotionIntelligence(requestText);

  return {
    prediction_promotion_explanation_active: true,
    request: requestText,
    promotion_band: promotion.promotion_band,
    promotion_eligible: promotion.promotion_eligible,
    explanation:
      promotion.promotion_eligible
        ? "Prediction passed readiness gates and is eligible for promotion."
        : "Prediction failed one or more readiness gates and should not be promoted.",
    promotion
  };
}
