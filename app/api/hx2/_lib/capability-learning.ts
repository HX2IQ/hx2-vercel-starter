import {
  getPlannerMemory
} from "./capability-memory";

export function buildPlannerLearningSignals() {

  const memory =
    getPlannerMemory();

  const nodeFrequency: Record<string, number> = {};
  const modeFrequency: Record<string, number> = {};

  let escalationCount = 0;

  for (const row of memory) {

    nodeFrequency[row.selected_node] =
      (nodeFrequency[row.selected_node] || 0) + 1;

    modeFrequency[row.execution_mode] =
      (modeFrequency[row.execution_mode] || 0) + 1;

    if (row.escalation) {
      escalationCount++;
    }
  }

  return {
    total_runs: memory.length,
    escalation_rate:
      memory.length > 0
        ? Number(
            (
              escalationCount / memory.length
            ).toFixed(2)
          )
        : 0,

    node_frequency: nodeFrequency,
    execution_mode_frequency: modeFrequency
  };
}
