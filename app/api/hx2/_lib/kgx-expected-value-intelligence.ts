import { buildKgxPlanScoringIntelligence } from "./kgx-plan-scoring-intelligence";

export async function buildKgxExpectedValueIntelligence() {
  const scoring =
    await buildKgxPlanScoringIntelligence();

  const expectedValue =
    Math.round(
      Number(scoring.plan_score || 0) *
      Number(scoring.execution_confidence || 0)
    );

  return {
    expected_value_intelligence_active: true,
    plan_score: scoring.plan_score,
    expected_value: expectedValue,
    expected_value_band:
      expectedValue >= 60
        ? "high"
        : expectedValue >= 40
          ? "moderate"
          : "low"
  };
}
