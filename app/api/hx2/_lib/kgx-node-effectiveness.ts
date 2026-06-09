import { prisma } from "./kgx-lite";

export async function buildKgxNodeEffectiveness() {

  const executions =
    await prisma.executionEvent.findMany({
      include: { node: true },
      orderBy: { createdAt: "desc" },
      take: 1000
    });

  const relationships =
    await prisma.kgxRelationship.findMany({
      take: 1000
    });

  const attributions =
    await prisma.memoryRecord.findMany({
      where: {
        memoryType: "kgx_node_outcome_attribution"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 1000
    });

  const stats: Record<string, any> = {};

  function ensureNode(node: string) {
    if (!stats[node]) {
      stats[node] = {
        node,
        total: 0,
        completed: 0,
        failed: 0,
        relationshipCount: 0,
        attribution_total: 0,
        attribution_successes: 0,
        attribution_failures: 0,
        attribution_score_total: 0,
        lastExecution: null
      };
    }

    return stats[node];
  }

  for (const execution of executions) {

    const node =
      execution.node?.nodeKey ||
      "unknown";

    const stat = ensureNode(node);

    stat.total++;

    if (execution.status === "completed") {
      stat.completed++;
    }

    if (
      execution.status === "failed" ||
      execution.status === "error"
    ) {
      stat.failed++;
    }

    if (!stat.lastExecution) {
      stat.lastExecution =
        execution.createdAt;
    }
  }

  for (const rel of relationships) {
    const stat = ensureNode(rel.sourceId);
    stat.relationshipCount++;
  }

  for (const memory of attributions) {
    const payload: any = memory.payload;
    const stat = ensureNode(payload?.node || "unknown");

    stat.attribution_total++;

    if (payload?.success) {
      stat.attribution_successes++;
    }
    else {
      stat.attribution_failures++;
    }

    stat.attribution_score_total += Number(payload?.score || 0);
  }

  const rankings =
    Object.values(stats)
      .map((x: any) => {

        const successRate =
          x.total > 0
            ? x.completed / x.total
            : 0;

        const failureRate =
          x.total > 0
            ? x.failed / x.total
            : 0;

        const attributionAverage =
          x.attribution_total > 0
            ? x.attribution_score_total / x.attribution_total
            : 0;

        const score =
          (
            successRate * 50 +
            x.completed * 10 +
            x.relationshipCount * 5 -
            x.failed * 25 -
            failureRate * 50 +
            attributionAverage * 0.75 +
            x.attribution_successes * 8 -
            x.attribution_failures * 15
          );

        return {
          ...x,
          successRate,
          failureRate,
          attributionAverage:
            Math.round(attributionAverage * 10) / 10,
          attribution_effectiveness_active:
            x.attribution_total > 0,
          failurePenalty:
            Math.round(
              (
                x.failed * 25 +
                failureRate * 50 +
                x.attribution_failures * 15
              ) * 10
            ) / 10,
          effectivenessScore:
            Math.round(score * 10) / 10
        };
      })
      .sort(
        (a: any, b: any) =>
          b.effectivenessScore -
          a.effectivenessScore
      );

  return {
    effectiveness_active: true,
    failure_aware_effectiveness_active: true,
    attribution_effectiveness_active: true,
    rankings
  };
}
