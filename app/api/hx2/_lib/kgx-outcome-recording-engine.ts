import { prisma } from "./kgx-lite";

export async function buildKgxOutcomeRecordingEngine() {
  const outcomeCount =
    await prisma.memoryRecord.count({
      where: {
        memoryType: "kgx_pipeline_outcome"
      }
    });

  return {
    outcome_recording_engine_active: true,
    tracked_outcomes: outcomeCount,
    recording_ready: true
  };
}
