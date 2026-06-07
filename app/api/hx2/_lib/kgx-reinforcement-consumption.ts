import { buildKgxReinforcementApplicationPreview } from "./kgx-reinforcement-application-preview";

export async function buildKgxReinforcementConsumption() {
  const preview = await buildKgxReinforcementApplicationPreview();

  const weights: Record<string, number> = {};

  for (const item of preview.applied || []) {
    weights[item.node] = Number(item.reinforced_weight || 1);
  }

  return {
    reinforcement_consumption_active: true,
    routing_mutation_mode: "preview_weighted",
    weights
  };
}
