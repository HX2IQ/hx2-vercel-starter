import { prisma } from "./kgx-lite";

function applyDecay(
  weight: number,
  ageDays: number
) {
  const decayRatePerDay = 0.003;
  const decayFactor = Math.max(
    0.5,
    1 - ageDays * decayRatePerDay
  );

  return Math.round(weight * decayFactor * 100) / 100;
}

export async function recallLatestKgxReinforcementMemory() {
  const memory = await prisma.memoryRecord.findFirst({
    where: {
      memoryType: "kgx_reinforcement_weights"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const rawWeights =
    (memory?.payload as any)?.weights || {};

  const createdAt =
    memory?.createdAt
      ? new Date(memory.createdAt)
      : null;

  const ageDays =
    createdAt
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const decayedWeights: Record<string, number> = {};

  for (const [node, weight] of Object.entries(rawWeights)) {
    decayedWeights[node] = applyDecay(
      Number(weight || 1),
      ageDays
    );
  }

  return {
    reinforcement_recall_active: true,
    reinforcement_decay_active: true,
    found: !!memory,
    memory,
    age_days: ageDays,
    raw_weights: rawWeights,
    weights: decayedWeights,
    routing_mutation_mode:
      (memory?.payload as any)?.routing_mutation_mode ||
      "preview_weighted"
  };
}
