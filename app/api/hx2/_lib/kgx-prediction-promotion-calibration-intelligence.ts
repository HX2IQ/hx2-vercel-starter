import { buildKgxPredictionPromotionEffectivenessTracking } from "./kgx-prediction-promotion-effectiveness-tracking";

export async function buildKgxPredictionPromotionCalibrationIntelligence() {
  const effectiveness =
    await buildKgxPredictionPromotionEffectivenessTracking();

  const successRate =
    Number(effectiveness.promotion_success_rate || 0);

  const calibrationMultiplier =
    effectiveness.promoted_outcomes < 5
      ? 1
      : successRate >= 0.8
        ? 1.15
        : successRate >= 0.6
          ? 1.05
          : successRate >= 0.4
            ? 0.95
            : 0.85;

  return {
    prediction_promotion_calibration_intelligence_active: true,
    promoted_outcomes: effectiveness.promoted_outcomes,
    promotion_success_rate: successRate,
    calibration_multiplier: calibrationMultiplier,
    effectiveness_band: effectiveness.effectiveness_band
  };
}
