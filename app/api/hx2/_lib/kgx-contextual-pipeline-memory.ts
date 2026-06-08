import { prisma } from "./kgx-lite";
import { buildKgxContextTags } from "./kgx-context-tags";

export async function persistKgxContextualPipelineMemory(
  capabilityPlanId: string,
  requestText: string,
  pipeline: any[]
) {
  const context = buildKgxContextTags(requestText);

  const memory = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_contextual_pipeline",
      memoryKey: `contextual_pipeline_${capabilityPlanId}`,
      payload: {
        capabilityPlanId,
        requestText,
        context_tags: context.tags,
        pipeline,
        createdBy: "kgx_phase_6a_contextual_pipeline_memory"
      }
    }
  });

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_contextual_pipeline_persisted",
      eventSource: "api/hx2/kgx-contextual-pipeline-write",
      payload: {
        memory_id: memory.id,
        capability_plan_id: capabilityPlanId,
        context_tags: context.tags,
        pipeline_steps: pipeline.length
      }
    }
  });

  return {
    contextual_pipeline_memory_active: true,
    memory,
    audit
  };
}
