import { prisma } from "./kgx-lite";

export async function buildKgxRoutingReinforcement() {
  const executions = await prisma.executionEvent.findMany({
    include: { node: true },
    orderBy: { createdAt: "desc" },
    take: 1000
  });

  const stats: Record<string, any> = {};

  for (const execution of executions) {
    const node = execution.node?.nodeKey || "unknown";

    if (!stats[node]) {
      stats[node] = {
        node,
        reward_score: 0,
        penalty_score: 0,
        completed: 0,
        failed: 0,
        total: 0
      };
    }

    stats[node].total++;

    if (execution.status === "completed") {
      stats[node].completed++;
      stats[node].reward_score += 10;
    }

    if (execution.status === "failed" || execution.status === "error") {
      stats[node].failed++;
      stats[node].penalty_score += 15;
    }
  }

  const rankings = Object.values(stats).map((x: any) => ({
    ...x,
    net_score: x.reward_score - x.penalty_score
  })).sort((a: any, b: any) => b.net_score - a.net_score);

  return {
    routing_reinforcement_active: true,
    rankings
  };
}
