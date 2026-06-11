import { buildKgxActionPrioritization } from "./kgx-action-prioritization";

export async function buildKgxActionDependencyIntelligence() {
  const priorities =
    await buildKgxActionPrioritization();

  const action =
    priorities.highest_priority_action || "unknown";

  return {
    action_dependency_intelligence_active: true,
    primary_action: action,
    dependencies: [
      `${action}:data`,
      `${action}:validation`,
      `${action}:execution`
    ],
    dependency_count: 3
  };
}
