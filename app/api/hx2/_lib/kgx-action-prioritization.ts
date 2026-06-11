import { buildKgxBottleneckIntelligence } from "./kgx-bottleneck-intelligence";

export async function buildKgxActionPrioritization() {
  const bottleneck =
    await buildKgxBottleneckIntelligence();

  return {
    action_prioritization_active: true,
    highest_priority_action:
      bottleneck.primary_bottleneck,
    priority_score:
      bottleneck.bottleneck_score,
    bottleneck
  };
}
