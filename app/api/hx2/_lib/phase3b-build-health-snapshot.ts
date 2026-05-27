import { getPhase3BSprintSnapshot } from "./phase3b-sprint-snapshot";
import { getPhase3BReleaseManifest } from "./phase3b-release-manifest";

export function getPhase3BBuildHealthSnapshot() {
  const sprint = getPhase3BSprintSnapshot();
  const manifest = getPhase3BReleaseManifest();

  return {
    ok: sprint.ok === true && manifest.ok === true,
    snapshot_id: "hx2-phase3b-build-health",
    snapshot_mode: "read_only_build_health",
    phase: "phase_3b",
    composition_mutation_allowed: false,

    health: {
      compiler_ready: manifest.readiness.compiler_ready,
      blocking_reasons: manifest.readiness.blocking_reasons,
      route_count: sprint.route_contracts.route_count,
      planned_stage_count: sprint.orchestration.planned_stage_count,
    },

    orchestration: sprint.orchestration,
    route_contracts: sprint.route_contracts,
  };
}
