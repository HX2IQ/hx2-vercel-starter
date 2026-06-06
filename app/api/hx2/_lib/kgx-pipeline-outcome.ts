import { prisma } from "./kgx-lite";

export async function writeKgxPipelineOutcome(
  capabilityPlanId: string,
  success: boolean,
  score: number,
  notes?: string
) {
  const memory = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_pipeline_outcome",
      memoryKey: `pipeline_outcome_${capabilityPlanId}`,
      payload: {
        capabilityPlanId,
        success,
        score,
        notes: notes ?? null
      }
    }
  });

  await prisma.auditEvent.create({
    data: {
      eventType: "kgx_pipeline_outcome_recorded",
      eventSource: "api/hx2/kgx-pipeline-outcome",
      payload: {
        capability_plan_id: capabilityPlanId,
        success,
        score,
        memory_id: memory.id
      }
    }
  });

  return memory;
}



