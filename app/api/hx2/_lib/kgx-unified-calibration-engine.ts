import { buildKgxCalibrationStatisticsEngine } from "./kgx-calibration-statistics-engine";
import { buildKgxDecisionCalibrationFeedback } from "./kgx-decision-calibration-feedback";
import { buildKgxLearningSignalAggregator } from "./kgx-learning-signal-aggregator";
import { buildKgxPredictionPromotionCalibrationIntelligence } from "./kgx-prediction-promotion-calibration-intelligence";
import { buildKgxPredictiveCalibrationIntelligence } from "./kgx-predictive-calibration-intelligence";

export async function buildKgxUnifiedCalibrationEngine() {
  const [
    stats,
    decisionFeedback,
    learningSignal,
    promotionCalibration,
    predictiveCalibration
  ] = await Promise.all([
    buildKgxCalibrationStatisticsEngine(),
    buildKgxDecisionCalibrationFeedback(),
    buildKgxLearningSignalAggregator(),
    buildKgxPredictionPromotionCalibrationIntelligence(),
    buildKgxPredictiveCalibrationIntelligence()
  ]);

  const multipliers = [
    Number(stats.calibration_multiplier || 1),
    Number(decisionFeedback.calibration_multiplier || 1),
    Number(promotionCalibration.calibration_multiplier || 1),
    Number(predictiveCalibration.confidence_multiplier || 1)
  ];

  const unifiedMultiplier =
    Math.round(
      (
        multipliers.reduce((sum, value) => sum + value, 0) /
        Math.max(multipliers.length, 1)
      ) * 1000
    ) / 1000;

  return {
    unified_calibration_engine_active: true,
    unified_calibration_multiplier: unifiedMultiplier,
    calibration_band:
      learningSignal.learning_signal_strength === "strong"
        ? "high_confidence"
        : learningSignal.learning_signal_strength === "moderate"
          ? "moderate_confidence"
          : "low_confidence",
    source_count: multipliers.length,
    stats,
    decisionFeedback,
    learningSignal,
    promotionCalibration,
    predictiveCalibration
  };
}
