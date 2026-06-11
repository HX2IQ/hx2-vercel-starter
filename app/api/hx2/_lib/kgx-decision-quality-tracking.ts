import { prisma } from "./kgx-lite";

export async function buildKgxDecisionQualityTracking() {
  const outcomes =
    await prisma.memoryRecord.count({
      where: {
        memoryType: "kgx_pipeline_outcome"
      }
    });

  return {
    decision_quality_tracking_active: true,
    tracked_outcomes: outcomes,
    quality_tracking_ready: outcomes > 0
  };
}
