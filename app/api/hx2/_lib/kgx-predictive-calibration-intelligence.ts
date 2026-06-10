import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";
import { buildKgxPredictiveDriftIntelligence } from "./kgx-predictive-drift-intelligence";

export async function buildKgxPredictiveCalibrationIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const drift =
    await buildKgxPredictiveDriftIntelligence();

  const accuracy =
    Number(tracking.prediction_accuracy || 0);

  const totalPredictions =
    Number(tracking.total_predictions || 0);

  const baseConfidenceMultiplier =
    totalPredictions === 0
      ? 1
      : accuracy >= 0.85
        ? 1.15
        : accuracy >= 0.7
          ? 1.05
          : accuracy >= 0.5
            ? 0.95
            : 0.8;

  const driftAdjustment =
    drift.drift_state === "improving"
      ? 0.05
      : drift.drift_state === "degrading"
        ? -0.1
        : 0;

  const confidenceMultiplier =
    Math.round(
      Math.max(
        0.5,
        Math.min(
          1.25,
          baseConfidenceMultiplier + driftAdjustment
        )
      ) * 100
    ) / 100;

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
    base_confidence_multiplier: baseConfidenceMultiplier,
    drift_adjustment: driftAdjustment,
    confidence_multiplier: confidenceMultiplier,
    predictive_drift_intelligence: drift,
    reason:
      totalPredictions === 0
        ? "no prediction history available yet"
        : drift.drift_state === "degrading"
          ? "predictive calibration reduced because drift is degrading"
          : drift.drift_state === "improving"
            ? "predictive calibration increased because drift is improving"
            : "calibrated from predictive accuracy history"
  };
}

