import { buildKgxPredictionPromotionEffectivenessTracking } from "./kgx-prediction-promotion-effectiveness-tracking";
import { buildKgxPredictionPromotionBaselineIntelligence } from "./kgx-prediction-promotion-baseline-intelligence";

export async function buildKgxPredictionPromotionComparativeEffectiveness() {
  const promoted =
    await buildKgxPredictionPromotionEffectivenessTracking();

  const baseline =
    await buildKgxPredictionPromotionBaselineIntelligence();

  const promotionDelta =
    Math.round(
      (
        Number(promoted.promotion_success_rate || 0) -
        Number(baseline.baseline_success_rate || 0)
      ) * 1000
    ) / 1000;

  return {
    prediction_promotion_comparative_effectiveness_active: true,
    promoted_success_rate: promoted.promotion_success_rate,
    baseline_success_rate: baseline.baseline_success_rate,
    promotion_delta: promotionDelta,
    comparative_band:
      promoted.promoted_outcomes === 0 || baseline.baseline_outcomes === 0
        ? "insufficient_data"
        : promotionDelta >= 0.15
          ? "strong_advantage"
          : promotionDelta >= 0.05
            ? "moderate_advantage"
            : promotionDelta >= -0.05
              ? "neutral"
              : "underperforming",
    promoted,
    baseline
  };
}
