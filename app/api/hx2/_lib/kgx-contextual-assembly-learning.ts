import { prisma } from "./kgx-lite";

export async function buildKgxContextualAssemblyLearning() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_assembly_outcome_attribution"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  const stats: Record<string, any> = {};

  for (const memory of memories) {
    const payload: any = memory.payload;
    const tags = payload?.context_tags || ["uncategorized"];
    const assemblyKey = payload?.assembly_key || "unknown";

    for (const tag of tags) {
      const key = `${tag}::${assemblyKey}`;

      if (!stats[key]) {
        stats[key] = {
          context_tag: tag,
          assembly_key: assemblyKey,
          outcomes: 0,
          successes: 0,
          failures: 0,
          score_total: 0,
          lastOutcome: memory.createdAt
        };
      }

      stats[key].outcomes++;

      if (payload?.success) {
        stats[key].successes++;
      }
      else {
        stats[key].failures++;
      }

      stats[key].score_total += Number(payload?.score || 0);
    }
  }

  const rankings =
    Object.values(stats)
      .map((x: any) => {
        const successRate = x.outcomes > 0 ? x.successes / x.outcomes : 0;
        const averageScore = x.outcomes > 0 ? x.score_total / x.outcomes : 0;

        return {
          ...x,
          success_rate: Math.round(successRate * 100) / 100,
          average_score: Math.round(averageScore * 10) / 10,
          contextual_effectiveness_score:
            Math.round((averageScore + successRate * 50 + x.outcomes * 3) * 10) / 10
        };
      })
      .sort((a: any, b: any) => b.contextual_effectiveness_score - a.contextual_effectiveness_score);

  return {
    contextual_assembly_learning_active: true,
    ranking_count: rankings.length,
    rankings
  };
}
