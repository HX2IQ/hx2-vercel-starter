import { prisma } from "./kgx-lite";

export async function buildKgxExecutionLearning() {

  const executions =
    await prisma.executionEvent.findMany({
      include: { node: true },
      orderBy: { createdAt: "desc" },
      take: 500
    });

  const attributions =
    await prisma.memoryRecord.findMany({
      where: {
        memoryType: "kgx_node_outcome_attribution"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 500
    });

  const stats: Record<string, any> = {};

  function ensureNode(nodeKey: string) {
    if (!stats[nodeKey]) {
      stats[nodeKey] = {
        node: nodeKey,
        total: 0,
        completed: 0,
        failed: 0,
        attribution_total: 0,
        attribution_successes: 0,
        attribution_failures: 0,
        attribution_score_total: 0,
        lastExecution: null
      };
    }

    return stats[nodeKey];
  }

  for (const execution of executions) {

    const nodeKey =
      execution.node?.nodeKey ||
      execution.nodeId ||
      "unknown";

    const stat = ensureNode(nodeKey);

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
      stat.lastExecution = execution.createdAt;
    }
  }

  for (const memory of attributions) {
    const payload: any = memory.payload;
    const nodeKey = payload?.node || "unknown";
    const stat = ensureNode(nodeKey);

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

        const attributionAverage =
          x.attribution_total > 0
            ? x.attribution_score_total / x.attribution_total
            : 0;

        return {
          ...x,
          successRate,
          attributionAverage:
            Math.round(attributionAverage * 10) / 10,
          attribution_learning_active:
            x.attribution_total > 0,
          effectivenessScore:
            Math.round(
              (
                successRate * 100 +
                x.completed +
                attributionAverage * 0.5 +
                x.attribution_successes * 5 -
                x.attribution_failures * 10
              ) * 10
            ) / 10
        };
      })
      .sort(
        (a: any, b: any) =>
          b.effectivenessScore -
          a.effectivenessScore
      );

  return {
    learning_active: true,
    attribution_learning_active: true,
    rankings
  };
}
