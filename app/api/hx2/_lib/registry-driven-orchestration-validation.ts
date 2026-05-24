import { sprintNextStageRegistry } from "./sprint-next-stage-registry";

export function validateSprintNextStageRegistry() {

  const requiredStageTypes = [
    "planning",
    "verification",
    "synthesis",
    "restraint",
    "decision"
  ];

  const stageTypes =
    sprintNextStageRegistry.map(
      (stage) => stage.stage_type
    );

  const helpers =
    sprintNextStageRegistry.map(
      (stage) => stage.helper
    );

  const helperDuplicates =
    helpers.filter(
      (helper, index) =>
        helpers.indexOf(helper) !== index
    );

  const missingTypes =
    requiredStageTypes.filter(
      (type) => !stageTypes.includes(type)
    );

  return {
    registry_valid:
      helperDuplicates.length === 0 &&
      missingTypes.length === 0,

    missing_stage_types:
      missingTypes,

    duplicate_helpers:
      Array.from(new Set(helperDuplicates)),

    stage_count:
      sprintNextStageRegistry.length
  };
}
