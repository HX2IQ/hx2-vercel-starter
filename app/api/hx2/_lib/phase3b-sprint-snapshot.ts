import { getPhase3BReleaseManifest } from "./phase3b-release-manifest";
import { getPhase3BRouteContractSummary } from "./phase3b-route-contract-summary";

export function getPhase3BSprintSnapshot() {
  const manifest = getPhase3BReleaseManifest();
  const summary = getPhase3BRouteContractSummary();

  return {
    ok: manifest.ok === true && summary.ok === true,
    snapshot_id: "hx2-phase3b-sprint-snapshot",
    phase: "phase_3b",
    snapshot_mode: "read_only_sprint_snapshot",
    composition_mutation_allowed: false,
    readiness: manifest.readiness,
    route_contracts: {
      route_count: summary.route_count,
      contracts: summary.contracts,
    },
    orchestration: {
      compiler_ready: manifest.summary.compiler_ready,
      dependencies_ready: manifest.summary.dependencies_ready,
      graph_ready: manifest.summary.graph_ready,
      execution_plan_ready: manifest.summary.execution_plan_ready,
      planned_stage_count: manifest.summary.planned_stage_count,
    },
  };
}
