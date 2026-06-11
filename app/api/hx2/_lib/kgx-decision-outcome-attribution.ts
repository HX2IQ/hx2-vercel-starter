import { prisma } from "./kgx-lite";

export async function buildKgxDecisionOutcomeAttribution() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  let decisions = 0;
  let successfulDecisions = 0;
  let failedDecisions = 0;
  let scoreTotal = 0;

  for (const memory of memories) {
    const payload: any = memory.payload || {};

    decisions++;

    if (payload.success) {
      successfulDecisions++;
    } else {
      failedDecisions++;
    }

    scoreTotal += Number(payload.score || 0);
  }

  const successRate =
    decisions > 0
      ? successfulDecisions / decisions
      : 0;

  const averageScore =
    decisions > 0
      ? scoreTotal / decisions
      : 0;

  return {
    decision_outcome_attribution_active: true,
    decisions,
    successful_decisions: successfulDecisions,
    failed_decisions: failedDecisions,
    success_rate:
      Math.round(successRate * 1000) / 1000,
    average_score:
      Math.round(averageScore * 10) / 10
  };
}
