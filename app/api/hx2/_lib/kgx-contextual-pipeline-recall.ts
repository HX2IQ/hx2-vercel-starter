import { prisma } from "./kgx-lite";

export async function recallKgxContextualPipelines(
  tag?: string
) {
  const memories =
    await prisma.memoryRecord.findMany({
      where: {
        memoryType: "kgx_contextual_pipeline"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

  const results =
    memories.filter((m: any) => {

      if (!tag) {
        return true;
      }

      const tags =
        (m.payload as any)?.context_tags || [];

      return tags.includes(tag);
    });

  return {
    contextual_pipeline_recall_active: true,
    tag_filter: tag || null,
    count: results.length,
    pipelines: results
  };
}
