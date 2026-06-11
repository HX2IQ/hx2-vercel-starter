import { buildKgxPredictionPromotionComparativeEffectiveness } from "./kgx-prediction-promotion-comparative-effectiveness";

export async function buildKgxPredictionPromotionDeltaIntelligence() {
  const comparative =
    await buildKgxPredictionPromotionComparativeEffectiveness();

  return {
    prediction_promotion_delta_intelligence_active: true,
    promotion_delta: comparative.promotion_delta,
    comparative_band: comparative.comparative_band,
    recommendation:
      comparative.comparative_band === "strong_advantage"
        ? "increase promotion confidence"
        : comparative.comparative_band === "moderate_advantage"
          ? "maintain promotion confidence"
          : comparative.comparative_band === "underperforming"
            ? "reduce promotion confidence"
            : "hold promotion calibration until more data is available",
    comparative
  };
}
