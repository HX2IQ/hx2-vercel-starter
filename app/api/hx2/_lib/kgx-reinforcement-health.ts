import { prisma } from "./kgx-lite";

export async function buildKgxReinforcementHealth() {
  const states = await prisma.memoryRecord.findMany({
    where: { memoryType: "kgx_reinforcement_state" },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const snapshots = await prisma.memoryRecord.findMany({
    where: { memoryType: "kgx_reinforcement_snapshot" },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const rawWeights = await prisma.memoryRecord.findMany({
    where: { memoryType: "kgx_reinforcement_weights" },
    orderBy: { createdAt: "desc" },
    take: 25
  });

  const latestState = states[0] || null;
  const weights =
    (latestState?.payload as any)?.weights || {};

  const entries = Object.entries(weights)
    .map(([node, weight]) => ({
      node,
      weight: Number(weight)
    }))
    .sort((a, b) => b.weight - a.weight);

  const averageWeight =
    entries.length > 0
      ? Math.round(
          (
            entries.reduce((sum, x) => sum + x.weight, 0) /
            entries.length
          ) * 100
        ) / 100
      : 0;

  return {
    reinforcement_health_active: true,
    state_count: states.length,
    snapshot_count: snapshots.length,
    raw_weight_memory_count: rawWeights.length,
    latest_state_id: latestState?.id || null,
    average_weight: averageWeight,
    top_reinforced_nodes: entries.slice(0, 10),
    lowest_reinforced_nodes: entries.slice(-10).reverse()
  };
}
