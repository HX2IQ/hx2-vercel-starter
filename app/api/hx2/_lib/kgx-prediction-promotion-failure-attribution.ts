import { buildKgxPredictionPromotionEffectivenessTracking } from "./kgx-prediction-promotion-effectiveness-tracking";

export async function buildKgxPredictionPromotionFailureAttribution() {
  const tracking =
    await buildKgxPredictionPromotionEffectivenessTracking();

  return {
    prediction_promotion_failure_attribution_active: true,
    promoted_failures: tracking.promoted_failures,
    promotion_success_rate: tracking.promotion_success_rate,
    effectiveness_band: tracking.effectiveness_band,
    failure_attribution:
      tracking.promoted_failures > 0
        ? "promoted predictions produced failed outcomes and should be reviewed"
        : "no promoted prediction failures recorded yet"
  };
}
