import { prisma } from "./kgx-lite";

export async function buildKgxRoutingReinforcement() {
  const executions = await prisma.executionEvent.findMany({
    include: { node: true },
    orderBy: { createdAt: "desc" },
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
        reward_score: 0,
        penalty_score: 0,
        attribution_reward_score: 0,
        attribution_penalty_score: 0,
        completed: 0,
        failed: 0,
        attribution_total: 0,
        total: 0
      };
    }

    return stats[node];
  }

  for (const execution of executions) {
    const node = execution.node?.nodeKey || "unknown";
    const stat = ensureNode(node);

    stat.total++;

    if (execution.status === "completed") {
      stat.completed++;
      stat.reward_score += 10;
    }

    if (execution.status === "failed" || execution.status === "error") {
      stat.failed++;
      stat.penalty_score += 15;
    }
  }

  for (const memory of attributions) {
    const payload: any = memory.payload;
    const stat = ensureNode(payload?.node || "unknown");
    const score = Number(payload?.score || 0);

    stat.attribution_total++;

    if (payload?.success) {
      stat.attribution_reward_score += Math.round(score / 10);
    }
    else {
      stat.attribution_penalty_score += Math.round(score / 8);
    }
  }

  const rankings = Object.values(stats).map((x: any) => ({
    ...x,
    attribution_reinforcement_active:
      x.attribution_total > 0,
    net_score:
      x.reward_score +
      x.attribution_reward_score -
      x.penalty_score -
      x.attribution_penalty_score
  })).sort((a: any, b: any) => b.net_score - a.net_score);

  return {
    routing_reinforcement_active: true,
    attribution_reinforcement_active: true,
    rankings
  };
}
