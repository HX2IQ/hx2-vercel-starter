import { buildManifestHealthSummary } from "./manifest-health-summary";
import { buildStageRegistryIntegrity } from "./sprint-next-stage-registry-integrity";
import { validateSprintNextStageRegistry } from "./registry-driven-orchestration-validation";

export function buildPhase3OrchestrationDiagnostics(
  executionLineageIntegrity: any
) {

  const manifestHealth =
    buildManifestHealthSummary();

  const registryIntegrity =
    buildStageRegistryIntegrity();

  const registryValidation =
    validateSprintNextStageRegistry();

  return {
    orchestration_phase:
      "phase_3_deterministic_orchestration_core",

    manifest_health:
      manifestHealth,

    registry_integrity:
      registryIntegrity,

    registry_validation:
      registryValidation,

    execution_lineage_integrity:
      executionLineageIntegrity
  };
}
