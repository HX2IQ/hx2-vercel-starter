import { buildKgxUnifiedStrategicScore } from "./kgx-unified-strategic-score";

export async function buildKgxDecisionConfidenceIntelligence() {
  const score =
    await buildKgxUnifiedStrategicScore();

  const confidence =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(score.unified_strategic_score)
      )
    );

  return {
    decision_confidence_intelligence_active: true,
    confidence_score: confidence,
    confidence_band:
      confidence >= 80
        ? "high"
        : confidence >= 60
          ? "moderate"
          : "low"
  };
}
