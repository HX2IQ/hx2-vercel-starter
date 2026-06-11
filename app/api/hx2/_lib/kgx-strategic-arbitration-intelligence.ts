import { buildKgxUnifiedStrategicScore } from "./kgx-unified-strategic-score";

export async function buildKgxStrategicArbitrationIntelligence() {
  const score =
    await buildKgxUnifiedStrategicScore();

  const arbitrationDecision =
    score.unified_strategic_score >= 60
      ? "approve"
      : score.unified_strategic_score >= 40
        ? "review"
        : "reject";

  return {
    strategic_arbitration_intelligence_active: true,
    unified_strategic_score: score.unified_strategic_score,
    arbitration_decision: arbitrationDecision
  };
}
