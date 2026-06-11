import { buildKgxRecommendationAdjustmentEngine } from "./kgx-recommendation-adjustment-engine";
import { buildKgxDecisionCalibrationFeedback } from "./kgx-decision-calibration-feedback";

export async function buildKgxSelfImprovementIntelligence() {
  const adjustment =
    await buildKgxRecommendationAdjustmentEngine();

  const feedback =
    await buildKgxDecisionCalibrationFeedback();

  return {
    self_improvement_intelligence_active: true,
    improvement_mode:
      feedback.calibration_band === "positive"
        ? "reinforce_successful_decision_patterns"
        : feedback.calibration_band === "negative"
          ? "reduce_underperforming_decision_patterns"
          : "continue_collecting_decision_outcomes",
    adjusted_recommendation:
      adjustment.adjusted_recommendation,
    adjusted_score:
      adjustment.adjusted_score,
    decision_success_rate:
      feedback.success_rate,
    feedback,
    adjustment
  };
}
