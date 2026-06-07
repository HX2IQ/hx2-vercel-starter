import { buildKgxReinforcementApplicationPreview } from "./kgx-reinforcement-application-preview";
import { recallLatestKgxReinforcementMemory } from "./kgx-reinforcement-recall";

export async function buildKgxReinforcementConsumption() {
  const recalled = await recallLatestKgxReinforcementMemory();

  if (
    recalled?.found &&
    Object.keys(recalled.weights || {}).length > 0
  ) {
    return {
      reinforcement_consumption_active: true,
      reinforcement_recall_consumption_active: true,
      source: "persisted_reinforcement_memory",
      routing_mutation_mode: recalled.routing_mutation_mode || "preview_weighted",
      weights: recalled.weights
    };
  }

  const preview = await buildKgxReinforcementApplicationPreview();

  const weights: Record<string, number> = {};

  for (const item of preview.applied || []) {
    weights[item.node] = Number(item.reinforced_weight || 1);
  }

  return {
    reinforcement_consumption_active: true,
    reinforcement_recall_consumption_active: false,
    source: "live_reinforcement_preview",
    routing_mutation_mode: "preview_weighted",
    weights
  };
}
