import { buildKgxActionDependencyIntelligence } from "./kgx-action-dependency-intelligence";

export async function buildKgxStrategicSequenceIntelligence() {
  const dependencies =
    await buildKgxActionDependencyIntelligence();

  return {
    strategic_sequence_intelligence_active: true,
    sequence: [
      "collect_data",
      "validate_inputs",
      "execute_action"
    ],
    primary_action: dependencies.primary_action,
    dependency_count: dependencies.dependency_count
  };
}
