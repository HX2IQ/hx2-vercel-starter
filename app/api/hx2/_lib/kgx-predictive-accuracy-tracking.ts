import { prisma } from "./kgx-lite";

export async function buildKgxPredictiveAccuracyTracking() {
  const memories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_pipeline_outcome"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  });

  let totalPredictions = 0;
  let correctPredictions = 0;

  const predictionHistory: any[] = [];

  for (const memory of memories) {
    const payload: any = memory.payload || {};

    if (
      payload.predicted_assembly &&
      payload.actual_assembly
    ) {
      totalPredictions++;

      const correct =
        payload.predicted_assembly ===
        payload.actual_assembly;

      if (correct) {
        correctPredictions++;
      }

      predictionHistory.push({
        predicted_assembly: payload.predicted_assembly,
        actual_assembly: payload.actual_assembly,
        correct,
        createdAt: memory.createdAt
      });
    }
  }

  const accuracy =
    totalPredictions > 0
      ? correctPredictions / totalPredictions
      : 0;

  return {
    predictive_accuracy_tracking_active: true,
    total_predictions: totalPredictions,
    correct_predictions: correctPredictions,
    prediction_accuracy:
      Math.round(accuracy * 1000) / 1000,
    prediction_history_count:
      predictionHistory.length,
    prediction_history:
      predictionHistory.slice(0, 25)
  };
}
