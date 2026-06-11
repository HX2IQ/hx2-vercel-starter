import { prisma } from "./kgx-lite";

export async function buildKgxPredictionPromotionEffectivenessTracking() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  let promoted = 0;
  let promotedSuccesses = 0;
  let promotedFailures = 0;

  for (const memory of memories) {
    const payload: any = memory.payload || {};

    if (
      payload.promotion_eligible === true ||
      payload.promotion_band === "promote"
    ) {
      promoted++;

      if (payload.success) {
        promotedSuccesses++;
      }
      else {
        promotedFailures++;
      }
    }
  }

  const promotionSuccessRate =
    promoted > 0
      ? promotedSuccesses / promoted
      : 0;

  return {
    prediction_promotion_effectiveness_tracking_active: true,
    promoted_outcomes: promoted,
    promoted_successes: promotedSuccesses,
    promoted_failures: promotedFailures,
    promotion_success_rate:
      Math.round(promotionSuccessRate * 1000) / 1000,
    effectiveness_band:
      promoted === 0
        ? "insufficient_data"
        : promotionSuccessRate >= 0.8
          ? "strong"
          : promotionSuccessRate >= 0.6
            ? "moderate"
            : "weak"
  };
}
