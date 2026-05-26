export type SprintHistorySummary = {
  top_sprint_type: string;
  top_execution_mode: string;
  top_success_node: string;
  top_failure_node: string;
};

function getTopKey(obj: Record<string, number> = {}) {
  const entries = Object.entries(obj);

  if (entries.length === 0) {
    return "unknown";
  }

  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function buildSprintHistorySummary(
  learning: any
): SprintHistorySummary {

  const reliability =
    learning?.node_reliability || {};

  const failureNodes =
    learning?.negative_learning?.node_failures || {};

  const successScores: Record<string, number> = {};

  for (const key of Object.keys(reliability)) {
    successScores[key] =
      Number(reliability[key]?.success_rate || 0);
  }

  return {
    top_sprint_type:
      getTopKey(
        learning?.sprint_type_frequency || {}
      ),

    top_execution_mode:
      getTopKey(
        learning?.execution_mode_frequency || {}
      ),

    top_success_node:
      getTopKey(successScores),

    top_failure_node:
      getTopKey(failureNodes)
  };
}
