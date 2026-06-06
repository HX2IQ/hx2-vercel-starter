import { prisma } from "./kgx-lite";

export async function buildKgxPipelineLineage(capabilityPlanId?: string) {
  const where = capabilityPlanId
    ? { sourceId: capabilityPlanId }
    : {};

  const relationships = await prisma.kgxRelationship.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return {
    pipeline_lineage_active: true,
    capabilityPlanId: capabilityPlanId || null,
    relationship_count: relationships.length,
    relationships
  };
}
