import { prisma } from "./kgx-lite";

export async function recallKgxPipelines(limit = 10) {
  const pipelines = await prisma.memoryRecord.findMany({
    where: {
      memoryType: "kgx_orchestration_pipeline"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  });

  return {
    pipeline_recall_active: true,
    count: pipelines.length,
    pipelines
  };
}
