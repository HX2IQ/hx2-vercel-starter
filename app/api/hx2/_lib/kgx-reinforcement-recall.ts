import { prisma } from "./kgx-lite";

export async function recallLatestKgxReinforcementMemory() {
  const memory = await prisma.memoryRecord.findFirst({
    where: {
      memoryType: "kgx_reinforcement_weights"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return {
    reinforcement_recall_active: true,
    found: !!memory,
    memory,
    weights: (memory?.payload as any)?.weights || {},
    routing_mutation_mode:
      (memory?.payload as any)?.routing_mutation_mode ||
      "preview_weighted"
  };
}
