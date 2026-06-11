import { buildKgxExecutionPathIntelligence } from "./kgx-execution-path-intelligence";

export async function buildKgxPlanReadinessIntelligence() {
  const path =
    await buildKgxExecutionPathIntelligence();

  return {
    plan_readiness_intelligence_active: true,
    execution_steps: path.execution_steps,
    readiness_score:
      Math.round(path.execution_confidence * 100),
    readiness_band:
      path.execution_confidence >= 0.7
        ? "ready"
        : "needs_review"
  };
}
