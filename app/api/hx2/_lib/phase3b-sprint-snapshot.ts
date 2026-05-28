import { getPhase3BReleaseManifest } from "./phase3b-release-manifest";
import { getPhase3BRouteContractSummary } from "./phase3b-route-contract-summary";
import { getPhase3BBuildProcessVersion } from "./phase3b-build-process-version";

export function getPhase3BSprintSnapshot() {
  const manifest = getPhase3BReleaseManifest();
  const summary = getPhase3BRouteContractSummary();
  const buildProcess = getPhase3BBuildProcessVersion();

  return {
    ok: manifest.ok === true && summary.ok === true,
    snapshot_id: "hx2-phase3b-sprint-snapshot",
    phase: "phase_3b",
    snapshot_mode: "read_only_sprint_snapshot",
    composition_mutation_allowed: false,
    readiness: manifest.readiness,
    speed_advisory: {
      enabled: true,
      cached_validation_advisory_only: buildProcess.capabilities.cached_validation_advisory_only,
      impact_speed_decision_advisory: buildProcess.capabilities.impact_speed_decision_advisory,
      validation_skipped: false,
    },

    route_contracts: {
      route_count: summary.route_count,
      contracts: summary.contracts,
    },
    build_process_version: {
      route: "/api/hx2/phase3b-build-process-version",
      expected_mode: "fast_safe_sprint",
      process_version: buildProcess.process_version,
      release_notes: buildProcess.release_notes,
    },
    build_health: {
      route: "/api/hx2/phase3b-build-health",
      expected_mode: "read_only_build_health",
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




