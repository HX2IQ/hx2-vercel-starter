import { buildKgxPredictionPromotionEffectivenessTracking } from "./kgx-prediction-promotion-effectiveness-tracking";

export async function buildKgxPredictionPromotionSuccessAttribution() {
  const tracking =
    await buildKgxPredictionPromotionEffectivenessTracking();

  return {
    prediction_promotion_success_attribution_active: true,
    promoted_successes: tracking.promoted_successes,
    promotion_success_rate: tracking.promotion_success_rate,
    effectiveness_band: tracking.effectiveness_band,
    success_attribution:
      tracking.promoted_successes > 0
        ? "promoted predictions produced successful outcomes"
        : "no promoted prediction successes recorded yet"
  };
}
