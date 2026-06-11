import { buildKgxPlanScoringIntelligence } from "./kgx-plan-scoring-intelligence";

export async function buildKgxPlanComparisonIntelligence() {
  const scoring =
    await buildKgxPlanScoringIntelligence();

  return {
    plan_comparison_intelligence_active: true,
    candidate_plans: 1,
    winning_plan_score: scoring.plan_score,
    selected_plan: "primary_execution_path"
  };
}
