import { recallKgxContextualPipelines } from "./kgx-contextual-pipeline-recall";

export async function buildKgxContextualRoutingBias(
  tags: string[]
) {
  const boosts: Record<string, number> = {};

  for (const tag of tags) {

    const recall =
      await recallKgxContextualPipelines(tag);

    for (const pipeline of recall.pipelines || []) {

      const nodes =
        (pipeline.payload as any)?.pipeline || [];

      for (const node of nodes) {

        const name =
          typeof node === "string"
            ? node
            : node?.node;

        if (!name) {
          continue;
        }

        boosts[name] =
          (boosts[name] || 0) + 10;
      }
    }
  }

  return {
    contextual_routing_bias_active: true,
    tags,
    boosts
  };
}
