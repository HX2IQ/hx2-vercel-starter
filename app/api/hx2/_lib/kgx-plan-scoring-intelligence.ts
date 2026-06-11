import { buildKgxExecutionPathIntelligence } from "./kgx-execution-path-intelligence";

export async function buildKgxPlanScoringIntelligence() {
  const path =
    await buildKgxExecutionPathIntelligence();

  const score =
    Math.round(
      (
        Number(path.execution_confidence || 0.5) * 70 +
        Math.min(Number(path.execution_steps || 0), 10) * 3
      ) * 10
    ) / 10;

  return {
    plan_scoring_intelligence_active: true,
    execution_steps: path.execution_steps,
    execution_confidence: path.execution_confidence,
    plan_score: score
  };
}
