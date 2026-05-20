import {
  getPlannerMemory
} from "./capability-memory";

export function buildPlannerLearningSignals() {

  const memory =
    getPlannerMemory();

  const nodeFrequency: Record<string, number> = {};
  const modeFrequency: Record<string, number> = {};
  const sprintTypeFrequency: Record<string, number> = {};
  const riskFrequency: Record<string, number> = {};
  const nodeQualityTotals: Record<string, number> = {};
  const nodeSuccessTotals: Record<string, number> = {};

  let escalationCount = 0;
  let successCount = 0;
  let qualityTotal = 0;

  for (const row of memory) {

    nodeFrequency[row.selected_node] =
      (nodeFrequency[row.selected_node] || 0) + 1;

    nodeQualityTotals[row.selected_node] =
      (nodeQualityTotals[row.selected_node] || 0) +
      (row.quality_score || 0);

    if (row.success) {
      nodeSuccessTotals[row.selected_node] =
        (nodeSuccessTotals[row.selected_node] || 0) + 1;
    }

    modeFrequency[row.execution_mode] =
      (modeFrequency[row.execution_mode] || 0) + 1;

    sprintTypeFrequency[row.sprint_type || "general"] =
      (sprintTypeFrequency[row.sprint_type || "general"] || 0) + 1;

    riskFrequency[row.execution_risk || "unknown"] =
      (riskFrequency[row.execution_risk || "unknown"] || 0) + 1;

    if (row.escalation) {
      escalationCount++;
    }

    if (row.success) {
      successCount++;
    }

    qualityTotal += row.quality_score || 0;
  }


  const nodeReliability: Record<string, any> = {};

  for (const node of Object.keys(nodeFrequency)) {

    const runs =
      nodeFrequency[node] || 0;

    const successes =
      nodeSuccessTotals[node] || 0;

    const quality =
      nodeQualityTotals[node] || 0;

    nodeReliability[node] = {
      runs,
      success_rate:
        runs > 0
          ? Number((successes / runs).toFixed(2))
          : 0,

      average_quality:
        runs > 0
          ? Number((quality / runs).toFixed(2))
          : 0
    };
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

    success_rate:
      memory.length > 0
        ? Number((successCount / memory.length).toFixed(2))
        : 0,

    average_quality_score:
      memory.length > 0
        ? Number((qualityTotal / memory.length).toFixed(2))
        : 0,

    node_reliability: nodeReliability,

    sprint_type_frequency:
      sprintTypeFrequency,

    execution_risk_frequency:
      riskFrequency,

    node_frequency: nodeFrequency,
    execution_mode_frequency: modeFrequency
  };
}



