import { prisma } from "./kgx-lite";

export async function buildKgxStrategicGoalIntelligence() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 500
  });

  const goals: Record<string, number> = {};

  for (const memory of memories) {
    const payload: any = memory.payload || {};

    const tags =
      Array.isArray(payload.context_tags)
        ? payload.context_tags
        : [];

    for (const tag of tags) {
      goals[tag] = (goals[tag] || 0) + 1;
    }
  }

  const rankedGoals =
    Object.entries(goals)
      .map(([goal, frequency]) => ({
        goal,
        frequency
      }))
      .sort((a, b) => b.frequency - a.frequency);

  return {
    strategic_goal_intelligence_active: true,
    goal_count: rankedGoals.length,
    goals: rankedGoals
  };
}
