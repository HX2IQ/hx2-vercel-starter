import { prisma } from "./kgx-lite";

export async function buildKgxAssemblyLearning() {
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
    const key = payload?.assembly_key || "unknown";

    if (!stats[key]) {
      stats[key] = {
        assembly_key: key,
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

  const assemblies =
    Object.values(stats)
      .map((x: any) => {
        const successRate =
          x.outcomes > 0
            ? x.successes / x.outcomes
            : 0;

        const failureRate =
          x.outcomes > 0
            ? x.failures / x.outcomes
            : 0;

        const averageScore =
          x.outcomes > 0
            ? x.score_total / x.outcomes
            : 0;

        return {
          ...x,
          success_rate: Math.round(successRate * 100) / 100,
          failure_rate: Math.round(failureRate * 100) / 100,
          average_score: Math.round(averageScore * 10) / 10
        };
      })
      .sort((a: any, b: any) => b.average_score - a.average_score);

  return {
    assembly_learning_active: true,
    assembly_count: assemblies.length,
    assemblies
  };
}
