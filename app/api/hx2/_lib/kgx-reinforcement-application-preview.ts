import { buildKgxReinforcementPreview } from "./kgx-reinforcement-preview";

export async function buildKgxReinforcementApplicationPreview() {
  const preview = await buildKgxReinforcementPreview();

  const nodeWeights: Record<string, any> = {};

  for (const pipeline of preview.reinforcement || []) {
    const weight =
      Number(pipeline.reinforcement_weight || 1);

    for (const node of pipeline.nodes || []) {
      if (!nodeWeights[node]) {
        nodeWeights[node] = {
          node,
          current_weight: 1,
          pipeline_count: 0,
          total_reinforcement: 0
        };
      }

      nodeWeights[node].pipeline_count++;
      nodeWeights[node].total_reinforcement += weight;
    }
  }

  const applied = Object.values(nodeWeights)
    .map((x: any) => {
      const average =
        x.pipeline_count > 0
          ? x.total_reinforcement / x.pipeline_count
          : 1;

      return {
        node: x.node,
        current_weight: 1,
        reinforced_weight:
          Math.round(average * 100) / 100,
        pipeline_count: x.pipeline_count
      };
    })
    .sort(
      (a: any, b: any) =>
        b.reinforced_weight - a.reinforced_weight
    );

  return {
    reinforcement_application_preview_active: true,
    routing_mutation_active: false,
    applied
  };
}
