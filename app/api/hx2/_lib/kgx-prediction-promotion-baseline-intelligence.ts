import { prisma } from "./kgx-lite";

export async function buildKgxPredictionPromotionBaselineIntelligence() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  let baseline = 0;
  let baselineSuccesses = 0;
  let baselineFailures = 0;

  for (const memory of memories) {
    const payload: any = memory.payload || {};

    const promoted =
      payload.promotion_eligible === true ||
      payload.promotion_band === "promote";

    if (!promoted) {
      baseline++;

      if (payload.success) {
        baselineSuccesses++;
      }
      else {
        baselineFailures++;
      }
    }
  }

  const baselineSuccessRate =
    baseline > 0
      ? baselineSuccesses / baseline
      : 0;

  return {
    prediction_promotion_baseline_intelligence_active: true,
    baseline_outcomes: baseline,
    baseline_successes: baselineSuccesses,
    baseline_failures: baselineFailures,
    baseline_success_rate:
      Math.round(baselineSuccessRate * 1000) / 1000
  };
}
