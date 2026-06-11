import { buildKgxPredictionReadinessAttribution } from "./kgx-prediction-readiness-attribution";
import { buildKgxPredictionPromotionCalibrationIntelligence } from "./kgx-prediction-promotion-calibration-intelligence";

export async function buildKgxPredictionPromotionIntelligence(
  requestText: string
) {
  const attribution =
    await buildKgxPredictionReadinessAttribution(requestText);

  const calibration =
    await buildKgxPredictionPromotionCalibrationIntelligence();

  const promotionEligible =
    attribution.ready &&
    attribution.failed_factors === 0;

  const calibratedPromotionBand =
    calibration.calibration_multiplier >= 1.1 &&
    promotionEligible
      ? "promote"
      : calibration.calibration_multiplier < 0.9
        ? "hold"
        : promotionEligible
          ? "promote"
          : attribution.passed_factors >= 2
            ? "hold"
            : "block";

  return {
    prediction_promotion_intelligence_active: true,
    request: requestText,
    promotion_eligible: promotionEligible,
    promotion_band: calibratedPromotionBand,
    calibration,
    reason:
      promotionEligible
        ? "prediction passed readiness attribution gates"
        : "prediction did not pass all readiness attribution gates",
    attribution
  };
}

