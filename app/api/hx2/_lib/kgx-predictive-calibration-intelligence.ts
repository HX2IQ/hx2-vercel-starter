import { buildKgxPredictiveAccuracyTracking } from "./kgx-predictive-accuracy-tracking";
import { buildKgxPredictiveDriftIntelligence } from "./kgx-predictive-drift-intelligence";
import { buildKgxPredictionHorizonIntelligence } from "./kgx-prediction-horizon-intelligence";
import { buildKgxPredictiveStabilityIntelligence } from "./kgx-predictive-stability-intelligence";

export async function buildKgxPredictiveCalibrationIntelligence() {
  const tracking =
    await buildKgxPredictiveAccuracyTracking();

  const drift =
    await buildKgxPredictiveDriftIntelligence();

  const horizon =
    await buildKgxPredictionHorizonIntelligence();

  const stability =
    await buildKgxPredictiveStabilityIntelligence();

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

  const horizonAdjustment =
    horizon.horizon_state === "short_term_outperforming"
      ? 0.05
      : horizon.horizon_state === "short_term_underperforming"
        ? -0.1
        : 0;

  const stabilityAdjustment =
    stability.stability_state === "stable"
      ? 0.03
      : stability.stability_state === "moderately_stable"
        ? 0
        : stability.stability_state === "volatile"
          ? -0.12
          : 0;

  const confidenceMultiplier =
    Math.round(
      Math.max(
        0.5,
        Math.min(
          1.35,
          baseConfidenceMultiplier +
          driftAdjustment +
          horizonAdjustment +
          stabilityAdjustment
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
    horizon_adjustment: horizonAdjustment,
    stability_adjustment: stabilityAdjustment,
    confidence_multiplier: confidenceMultiplier,
    predictive_drift_intelligence: drift,
    prediction_horizon_intelligence: horizon,
    predictive_stability_intelligence: stability,
    reason:
      totalPredictions === 0
        ? "no prediction history available yet"
        : stability.stability_state === "volatile"
          ? "predictive calibration reduced because prediction stability is volatile"
          : stability.stability_state === "stable"
            ? "predictive calibration increased because prediction stability is stable"
            : horizon.horizon_state === "short_term_underperforming"
          ? "predictive calibration reduced because short-term horizon is underperforming"
          : horizon.horizon_state === "short_term_outperforming"
            ? "predictive calibration increased because short-term horizon is outperforming"
            : drift.drift_state === "degrading"
              ? "predictive calibration reduced because drift is degrading"
              : drift.drift_state === "improving"
                ? "predictive calibration increased because drift is improving"
                : "calibrated from predictive accuracy history"
  };
}



