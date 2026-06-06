import { prisma } from "./kgx-lite";

export async function persistKgxPipeline(input: {
  requestText: string;
  capabilityPlanId: string;
  pipeline: any[];
}) {
  const pipelineMemory = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_orchestration_pipeline",
      memoryKey: `pipeline_${input.capabilityPlanId}`,
      payload: {
        requestText: input.requestText,
        capabilityPlanId: input.capabilityPlanId,
        pipeline: input.pipeline
      }
    }
  });

  await prisma.kgxRelationship.create({
    data: {
      sourceType: "CapabilityPlan",
      sourceId: input.capabilityPlanId,
      relationType: "has_pipeline",
      targetType: "MemoryRecord",
      targetId: pipelineMemory.id,
      payload: {
        memoryKey: pipelineMemory.memoryKey
      }
    }
  });

  for (const step of input.pipeline || []) {
    await prisma.kgxRelationship.create({
      data: {
        sourceType: "CapabilityPlan",
        sourceId: input.capabilityPlanId,
        relationType: `pipeline_${step.role}`,
        targetType: "Node",
        targetId: step.node,
        payload: step
      }
    });
  }

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_pipeline_created",
      eventSource: "api/hx2/capability-planner",
      payload: {
        capability_plan_id: input.capabilityPlanId,
        pipeline_memory_id: pipelineMemory.id,
        step_count: input.pipeline?.length || 0
      }
    }
  });

  return {
    pipeline_persistence_active: true,
    pipelineMemory,
    audit
  };
}
