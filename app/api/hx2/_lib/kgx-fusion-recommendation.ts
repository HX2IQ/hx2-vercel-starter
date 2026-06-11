import { buildKgxUnifiedStrategicScore } from "./kgx-unified-strategic-score";

export async function buildKgxFusionRecommendation() {
  const score =
    await buildKgxUnifiedStrategicScore();

  let recommendation = "defer";

  if (score.unified_strategic_score >= 60) {
    recommendation = "execute";
  } else if (score.unified_strategic_score >= 40) {
    recommendation = "review_then_execute";
  }

  return {
    fusion_recommendation_active: true,
    unified_strategic_score:
      score.unified_strategic_score,
    recommendation
  };
}
