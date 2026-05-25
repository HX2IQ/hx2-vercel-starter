import { buildStageRegistryIntegrity } from "./sprint-next-stage-registry-integrity";
import { validateSprintNextStageRegistry } from "./registry-driven-orchestration-validation";

export function buildManifestHealthSummary() {
  const integrity =
    buildStageRegistryIntegrity();

  const validation =
    validateSprintNextStageRegistry();

  return {
    manifest_ok:
      integrity?.registry_ok === true &&
      validation?.registry_valid === true,

    stage_count:
      integrity?.stage_count ?? 0,

    duplicate_ids:
      integrity?.duplicate_ids || [],

    duplicate_helpers:
      integrity?.duplicate_helpers || [],

    missing_stage_types:
      validation?.missing_stage_types || []
  };
}
