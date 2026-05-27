import { sprintNextStageRegistry } from "./sprint-next-stage-registry";

type StageType =
  | "planning"
  | "verification"
  | "synthesis"
  | "restraint"
  | "decision";

export function validateSprintNextStageRegistry() {
  const requiredStageTypes: StageType[] = [
    "planning",
    "verification",
    "synthesis",
    "restraint",
    "decision"
  ];

  const stageTypes: StageType[] = sprintNextStageRegistry.map(
    (stage) => stage.stage_type
  );

  const helpers = sprintNextStageRegistry.map(
    (stage) => stage.helper
  );

  const helperDuplicates = helpers.filter(
    (helper, index) => helpers.indexOf(helper) !== index
  );

  const missingTypes = requiredStageTypes.filter(
    (type) => !stageTypes.includes(type)
  );

  const registryValid =
    helperDuplicates.length === 0 &&
    missingTypes.length === 0;

  return {
    ok: registryValid,
    registry_valid: registryValid,
    missing_stage_types: missingTypes,
    duplicate_helpers: Array.from(new Set(helperDuplicates)),
    stage_count: sprintNextStageRegistry.length
  };
}

export const validateRegistryDrivenOrchestration = validateSprintNextStageRegistry;
export const registryDrivenOrchestrationValidation = validateSprintNextStageRegistry;
