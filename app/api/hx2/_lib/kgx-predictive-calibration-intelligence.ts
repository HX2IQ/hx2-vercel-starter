import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";

export async function buildKgxPredictiveCalibrationIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const accuracy =
    Number(tracking.prediction_accuracy || 0);

  const totalPredictions =
    Number(tracking.total_predictions || 0);

  const confidenceMultiplier =
    totalPredictions === 0
      ? 1
      : accuracy >= 0.85
        ? 1.15
        : accuracy >= 0.7
          ? 1.05
          : accuracy >= 0.5
            ? 0.95
            : 0.8;

  const calibrationBand =
    totalPredictions === 0
      ? "insufficient_data"
      : accuracy >= 0.85
        ? "high_confidence"
        : accuracy >= 0.7
          ? "moderate_confidence"
          : accuracy >= 0.5
            ? "low_confidence"
            : "poor_confidence";

  return {
    predictive_calibration_intelligence_active: true,
    total_predictions: totalPredictions,
    correct_predictions: tracking.correct_predictions,
    prediction_accuracy: accuracy,
    calibration_band: calibrationBand,
    confidence_multiplier: confidenceMultiplier,
    reason:
      totalPredictions === 0
        ? "no prediction history available yet"
        : "calibrated from predictive accuracy history"
  };
}
