import { prisma } from "./kgx-lite";

export async function buildKgxRoutingDecisionOutcomeAttribution() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  const stats: Record<string, any> = {};

  for (const memory of memories) {
    const payload: any = memory.payload;
    const pipeline = Array.isArray(payload?.pipeline)
      ? payload.pipeline
      : [];

    const assemblyKey =
      pipeline
        .map((step: any) => step?.node)
        .filter(Boolean)
        .join(" + ") || "unknown";

    if (!stats[assemblyKey]) {
      stats[assemblyKey] = {
        assembly_key: assemblyKey,
        outcomes: 0,
        successes: 0,
        failures: 0,
        score_total: 0,
        lastOutcome: memory.createdAt
      };
    }

    stats[assemblyKey].outcomes++;

    if (payload?.success) {
      stats[assemblyKey].successes++;
    }
    else {
      stats[assemblyKey].failures++;
    }

    stats[assemblyKey].score_total += Number(payload?.score || 0);
  }

  const attributions =
    Object.values(stats)
      .map((x: any) => {
        const successRate =
          x.outcomes > 0
            ? x.successes / x.outcomes
            : 0;

        const averageScore =
          x.outcomes > 0
            ? x.score_total / x.outcomes
            : 0;

        const routingDecisionScore =
          Math.round(
            (
              averageScore +
              successRate * 50 -
              x.failures * 20 +
              Math.min(x.outcomes, 10) * 3
            ) * 10
          ) / 10;

        return {
          ...x,
          success_rate: Math.round(successRate * 100) / 100,
          average_score: Math.round(averageScore * 10) / 10,
          routing_decision_score: routingDecisionScore
        };
      })
      .sort(
        (a: any, b: any) =>
          b.routing_decision_score -
          a.routing_decision_score
      );

  return {
    routing_decision_outcome_attribution_active: true,
    attribution_count: attributions.length,
    attributions
  };
}
