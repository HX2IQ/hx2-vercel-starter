import { buildKgxStrategicGoalIntelligence } from "./kgx-strategic-goal-intelligence";

export async function buildKgxOpportunityIntelligence() {
  const goals =
    await buildKgxStrategicGoalIntelligence();

  const opportunities =
    (goals.goals || []).slice(0, 10).map((goal: any) => ({
      opportunity: goal.goal,
      opportunity_score: goal.frequency
    }));

  return {
    opportunity_intelligence_active: true,
    opportunity_count: opportunities.length,
    opportunities
  };
}
