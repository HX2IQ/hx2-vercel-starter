import { prisma } from "./kgx-lite";
import { writeKgxNodeOutcomeAttribution } from "./kgx-node-outcome-attribution";
import { writeKgxAssemblyOutcomeAttribution } from "./kgx-assembly-outcome-attribution";

export async function writeKgxPipelineOutcome(
  capabilityPlanId: string,
  success: boolean,
  score: number,
  notes?: string,
  pipeline: any[] = []
) {
  const memory = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_pipeline_outcome",
      memoryKey: `pipeline_outcome_${capabilityPlanId}`,
      payload: {
        capabilityPlanId,
        success,
        score,
        notes: notes ?? null,
        pipeline
      }
    }
  });

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_pipeline_outcome_recorded",
      eventSource: "api/hx2/kgx-pipeline-outcome",
      payload: {
        capability_plan_id: capabilityPlanId,
        success,
        score,
        memory_id: memory.id,
        pipeline_steps: pipeline.length
      }
    }
  });

  await prisma.kgxRelationship.create({
    data: {
      sourceType: "CapabilityPlan",
      sourceId: capabilityPlanId,
      relationType: success ? "pipeline_success" : "pipeline_failure",
      targetType: "MemoryRecord",
      targetId: memory.id,
      payload: {
        score,
        notes: notes ?? null,
        pipeline_steps: pipeline.length
      }
    }
  });

  const nodeAttribution =
    await writeKgxNodeOutcomeAttribution(
      capabilityPlanId,
      pipeline,
      success,
      score,
      notes
    );

  const assemblyAttribution =
    await writeKgxAssemblyOutcomeAttribution(
      capabilityPlanId,
      pipeline,
      success,
      score,
      notes
    );

  return {
    memory,
    audit,
    nodeAttribution,
    assemblyAttribution
  };
}

