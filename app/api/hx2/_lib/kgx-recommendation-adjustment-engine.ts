import { buildKgxFusionRecommendation } from "./kgx-fusion-recommendation";
import { buildKgxDecisionCalibrationFeedback } from "./kgx-decision-calibration-feedback";

export async function buildKgxRecommendationAdjustmentEngine() {
  const recommendation =
    await buildKgxFusionRecommendation();

  const feedback =
    await buildKgxDecisionCalibrationFeedback();

  const adjustedScore =
    Math.round(
      Number(recommendation.unified_strategic_score || 0) *
      Number(feedback.calibration_multiplier || 1)
    );

  const adjustedRecommendation =
    adjustedScore >= 60
      ? "execute"
      : adjustedScore >= 40
        ? "review_then_execute"
        : "defer";

  return {
    recommendation_adjustment_engine_active: true,
    original_recommendation:
      recommendation.recommendation,
    original_score:
      recommendation.unified_strategic_score,
    calibration_multiplier:
      feedback.calibration_multiplier,
    adjusted_score: adjustedScore,
    adjusted_recommendation: adjustedRecommendation,
    feedback
  };
}
