import { sprintNextStageRegistry } from "./sprint-next-stage-registry";

export function buildStageRegistryIntegrity() {
  const ids = sprintNextStageRegistry.map((stage) => stage.id);
  const helpers = sprintNextStageRegistry.map((stage) => stage.helper);

  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const duplicateHelpers = helpers.filter((helper, index) => helpers.indexOf(helper) !== index);

  const byType: Record<string, number> = {};

  for (const stage of sprintNextStageRegistry) {
    byType[stage.stage_type] = (byType[stage.stage_type] || 0) + 1;
  }

  return {
    stage_count: sprintNextStageRegistry.length,
    by_type: byType,
    duplicate_ids: Array.from(new Set(duplicateIds)),
    duplicate_helpers: Array.from(new Set(duplicateHelpers)),
    registry_ok: duplicateIds.length === 0 && duplicateHelpers.length === 0
  };
}
