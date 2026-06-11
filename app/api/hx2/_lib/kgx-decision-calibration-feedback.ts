import { buildKgxDecisionOutcomeAttribution } from "./kgx-decision-outcome-attribution";

export async function buildKgxDecisionCalibrationFeedback() {
  const attribution =
    await buildKgxDecisionOutcomeAttribution();

  const multiplier =
    attribution.decisions < 5
      ? 1
      : attribution.success_rate >= 0.85
        ? 1.15
        : attribution.success_rate >= 0.7
          ? 1.05
          : attribution.success_rate >= 0.5
            ? 0.95
            : 0.85;

  return {
    decision_calibration_feedback_active: true,
    decisions: attribution.decisions,
    success_rate: attribution.success_rate,
    average_score: attribution.average_score,
    calibration_multiplier: multiplier,
    calibration_band:
      attribution.decisions < 5
        ? "insufficient_data"
        : multiplier > 1
          ? "positive"
          : multiplier < 1
            ? "negative"
            : "neutral",
    attribution
  };
}
