export function buildKgxPredictionPromotionCalibrationAuditTrail(
  calibration: any
) {
  return {
    prediction_promotion_calibration_audit_active: true,
    promoted_outcomes: calibration.promoted_outcomes,
    promotion_success_rate: calibration.promotion_success_rate,
    calibration_multiplier: calibration.calibration_multiplier,
    effectiveness_band: calibration.effectiveness_band
  };
}
