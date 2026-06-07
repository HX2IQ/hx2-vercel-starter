import { prisma } from "./kgx-lite";

type PipelineOutcome = {
  capabilityPlanId?: string;
  success?: boolean;
  score?: number;
  notes?: string | null;
};

export async function buildKgxReinforcementPreview() {
  const outcomes = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  const pipelineMemories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_orchestration_pipeline"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  const pipelineByPlanId: Record<string, any[]> = {};

  for (const memory of pipelineMemories) {
    const payload: any = memory.payload;
    const capabilityPlanId = payload?.capabilityPlanId;

    if (capabilityPlanId && Array.isArray(payload?.pipeline)) {
      pipelineByPlanId[capabilityPlanId] = payload.pipeline;
    }
  }

  const groups: Record<string, any> = {};

  for (const memory of outcomes) {
    const payload = memory.payload as PipelineOutcome;
    const capabilityPlanId = payload?.capabilityPlanId || "";
    const pipeline = pipelineByPlanId[capabilityPlanId] || [];

    const nodes = pipeline
      .map((step: any) => step.node)
      .filter(Boolean);

    const key = nodes.length > 0
      ? nodes.join(" + ")
      : capabilityPlanId || memory.memoryKey;

    if (!groups[key]) {
      groups[key] = {
        pipeline_key: key,
        nodes,
        outcomes: 0,
        successes: 0,
        failures: 0,
        score_total: 0
      };
    }

    groups[key].outcomes++;

    if (payload?.success) {
      groups[key].successes++;
    } else {
      groups[key].failures++;
    }

    groups[key].score_total += Number(payload?.score || 0);
  }

  const reinforcement = Object.values(groups)
    .map((group: any) => {
      const averageScore =
        group.outcomes > 0
          ? group.score_total / group.outcomes
          : 0;

      const successRate =
        group.outcomes > 0
          ? group.successes / group.outcomes
          : 0;

      const reinforcementWeight =
        Math.round(
          (
            1 +
            successRate * 0.5 +
            averageScore / 200 -
            group.failures * 0.15
          ) * 100
        ) / 100;

      return {
        pipeline_key: group.pipeline_key,
        nodes: group.nodes,
        outcomes: group.outcomes,
        successes: group.successes,
        failures: group.failures,
        average_score: Math.round(averageScore * 10) / 10,
        success_rate: Math.round(successRate * 100) / 100,
        reinforcement_weight: reinforcementWeight
      };
    })
    .sort(
      (a: any, b: any) =>
        b.reinforcement_weight - a.reinforcement_weight
    );

  return {
    reinforcement_preview_active: true,
    outcome_count: outcomes.length,
    pipeline_memory_count: pipelineMemories.length,
    reinforcement
  };
}
