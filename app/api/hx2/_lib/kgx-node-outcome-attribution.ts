import { prisma } from "./kgx-lite";

export async function writeKgxNodeOutcomeAttribution(
  capabilityPlanId: string,
  pipeline: any[],
  success: boolean,
  score: number,
  notes?: string
) {
  const attributions: any[] = [];

  for (const step of pipeline || []) {
    const node = step?.node;
    const role = step?.role || "unknown";

    if (!node) {
      continue;
    }

    const attributionScore =
      role === "primary"
        ? score
        : role === "challenge"
          ? Math.round(score * 0.75)
          : role === "validation"
            ? Math.round(score * 0.65)
            : Math.round(score * 0.5);

    const memory = await prisma.memoryRecord.create({
      data: {
        memoryType: "kgx_node_outcome_attribution",
        memoryKey: `node_outcome_${capabilityPlanId}_${node}_${role}_${Date.now()}`,
        payload: {
          capabilityPlanId,
          node,
          role,
          success,
          score: attributionScore,
          pipeline_score: score,
          notes: notes || null,
          createdBy: "kgx_phase_6d_node_outcome_attribution"
        }
      }
    });

    attributions.push(memory);
  }

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_node_outcome_attribution_recorded",
      eventSource: "api/hx2/kgx-pipeline-outcome",
      payload: {
        capability_plan_id: capabilityPlanId,
        attribution_count: attributions.length,
        success,
        score
      }
    }
  });

  return {
    node_outcome_attribution_active: true,
    attributions,
    audit
  };
}


