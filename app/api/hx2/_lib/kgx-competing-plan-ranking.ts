import { buildKgxUnifiedStrategicScore } from "./kgx-unified-strategic-score";

export async function buildKgxCompetingPlanRanking() {
  const score =
    await buildKgxUnifiedStrategicScore();

  return {
    competing_plan_ranking_active: true,
    ranked_plans: [
      {
        plan: "primary_strategy",
        score: score.unified_strategic_score,
        rank: 1
      }
    ]
  };
}
