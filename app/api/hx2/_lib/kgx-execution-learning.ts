import { prisma } from "./kgx-lite";

export async function buildKgxExecutionLearning() {

  const executions =
    await prisma.executionEvent.findMany({
      include: { node: true },
      orderBy: { createdAt: "desc" },
      take: 500
    });

  const stats: Record<string, any> = {};

  for (const execution of executions) {

    const nodeKey =
      execution.node?.nodeKey ||
      execution.nodeId ||
      "unknown";

    if (!stats[nodeKey]) {

      stats[nodeKey] = {
        node: nodeKey,
        total: 0,
        completed: 0,
        failed: 0,
        lastExecution: null
      };
    }

    stats[nodeKey].total++;

    if (execution.status === "completed") {
      stats[nodeKey].completed++;
    }

    if (
      execution.status === "failed" ||
      execution.status === "error"
    ) {
      stats[nodeKey].failed++;
    }

    if (!stats[nodeKey].lastExecution) {
      stats[nodeKey].lastExecution =
        execution.createdAt;
    }
  }

  const rankings =
    Object.values(stats)
      .map((x: any) => {

        const successRate =
          x.total > 0
            ? x.completed / x.total
            : 0;

        return {
          ...x,
          successRate,
          effectivenessScore:
            Math.round(
              (
                successRate * 100 +
                x.completed
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
    rankings
  };
}
