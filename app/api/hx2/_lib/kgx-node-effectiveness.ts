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

  const stats: Record<string, any> = {};

  for (const execution of executions) {

    const node =
      execution.node?.nodeKey ||
      "unknown";

    if (!stats[node]) {

      stats[node] = {
        node,
        total: 0,
        completed: 0,
        failed: 0,
        relationshipCount: 0,
        lastExecution: null
      };
    }

    stats[node].total++;

    if (execution.status === "completed")
      stats[node].completed++;

    if (
      execution.status === "failed" ||
      execution.status === "error"
    )
      stats[node].failed++;

    if (!stats[node].lastExecution)
      stats[node].lastExecution =
        execution.createdAt;
  }

  for (const rel of relationships) {

    const source =
      rel.sourceId;

    if (!stats[source]) {

      stats[source] = {
        node: source,
        total: 0,
        completed: 0,
        failed: 0,
        relationshipCount: 0,
        lastExecution: null
      };
    }

    stats[source].relationshipCount++;
  }

  const rankings =
    Object.values(stats)
      .map((x: any) => {

        const successRate =
          x.total > 0
            ? x.completed / x.total
            : 0;

        const score =
          (
            successRate * 50 +
            x.completed * 10 +
            x.relationshipCount * 5
          );

        return {
          ...x,
          successRate,
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
    rankings
  };
}
