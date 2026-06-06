import { prisma } from "./kgx-lite";

export async function buildKgxPipelineAnalytics() {
  const pipelineMemories = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_orchestration_pipeline"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  const audits = await prisma.auditEvent.findMany({
    where: {
      eventType: "kgx_pipeline_created"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  const roleCounts: Record<string, number> = {};

  for (const memory of pipelineMemories) {
    const payload: any = memory.payload;
    for (const step of payload?.pipeline || []) {
      roleCounts[step.role] = (roleCounts[step.role] || 0) + 1;
    }
  }

  return {
    pipeline_analytics_active: true,
    pipeline_count: pipelineMemories.length,
    audit_count: audits.length,
    role_counts: roleCounts
  };
}
