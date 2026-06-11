import { buildKgxCalibrationStatisticsEngine } from "./kgx-calibration-statistics-engine";
import { buildKgxPredictionResolutionEngine } from "./kgx-prediction-resolution-engine";

export async function buildKgxLearningSignalAggregator() {
  const stats =
    await buildKgxCalibrationStatisticsEngine();

  const resolution =
    await buildKgxPredictionResolutionEngine();

  return {
    learning_signal_aggregator_active: true,
    calibration_band:
      stats.calibration_band,
    success_rate:
      stats.success_rate,
    resolved_predictions:
      resolution.resolved_predictions,
    learning_signal_strength:
      resolution.resolved_predictions >= 25
        ? "strong"
        : resolution.resolved_predictions >= 10
          ? "moderate"
          : "weak"
  };
}
