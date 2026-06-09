import { prisma } from "./kgx-lite";

function assemblyKeyFromPipeline(pipeline: any[]) {
  return (pipeline || [])
    .map((step: any) => step?.node)
    .filter(Boolean)
    .join(" + ");
}

export async function writeKgxAssemblyOutcomeAttribution(
  capabilityPlanId: string,
  pipeline: any[],
  success: boolean,
  score: number,
  notes?: string
) {
  const assemblyKey = assemblyKeyFromPipeline(pipeline);

  const memory = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_assembly_outcome_attribution",
      memoryKey: `assembly_outcome_${capabilityPlanId}_${Date.now()}`,
      payload: {
        capabilityPlanId,
        assembly_key: assemblyKey,
        pipeline,
        success,
        score,
        notes: notes ?? null,
        createdBy: "kgx_phase_6f_assembly_outcome_attribution"
      }
    }
  });

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_assembly_outcome_attribution_recorded",
      eventSource: "api/hx2/kgx-pipeline-outcome",
      payload: {
        capability_plan_id: capabilityPlanId,
        assembly_key: assemblyKey,
        success,
        score,
        memory_id: memory.id
      }
    }
  });

  return {
    assembly_outcome_attribution_active: true,
    assembly_key: assemblyKey,
    memory,
    audit
  };
}
