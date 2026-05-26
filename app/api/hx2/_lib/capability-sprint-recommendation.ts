import {
  buildPlannerLearningSignals
} from "./capability-learning";

export function buildSprintRecommendation() {

  const learning =
    buildPlannerLearningSignals();

  const escalationRate =
    learning?.escalation_rate || 0;

  const modeFrequency =
    learning?.execution_mode_frequency || {};

  const pipelineRuns =
    modeFrequency.pipeline || 0;

  if (pipelineRuns < 3) {
    return {
      recommendation:
        "Expand orchestration pipeline coverage.",
      priority:
        "high",
      suggested_execution_mode:
        "pipeline"
    };
  }

  if (escalationRate > 0.4) {
    return {
      recommendation:
        "Improve confidence scoring and node arbitration.",
      priority:
        "high",
      suggested_execution_mode:
        "multi_node"
    };
  }

  return {
    recommendation:
      "Expand planner intelligence capabilities.",
    priority:
      "medium",
    suggested_execution_mode:
      "multi_node"
  };
}
