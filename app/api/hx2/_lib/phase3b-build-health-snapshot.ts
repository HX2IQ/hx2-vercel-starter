import { getPhase3BSprintSnapshot } from "./phase3b-sprint-snapshot";
import { getPhase3BReleaseManifest } from "./phase3b-release-manifest";
import { getPhase3BBuildProcessVersion } from "./phase3b-build-process-version";

export function getPhase3BBuildHealthSnapshot() {
  const sprint = getPhase3BSprintSnapshot();
  const manifest = getPhase3BReleaseManifest();
  const buildProcess = getPhase3BBuildProcessVersion();

  return {
    ok: sprint.ok === true && manifest.ok === true,
    snapshot_id: "hx2-phase3b-build-health",
    snapshot_mode: "read_only_build_health",
    phase: "phase_3b",
    composition_mutation_allowed: false,

    build_process: {
      process_mode: buildProcess.process_mode,
      process_version: buildProcess.process_version,
      release_notes: buildProcess.release_notes,
      capabilities: buildProcess.capabilities,
    },

    dashboard: {
      enabled: buildProcess.capabilities.build_dashboard,
      readonly_guard: buildProcess.capabilities.readonly_dashboard_guard,
      latest_production_verify_summary: buildProcess.capabilities.latest_production_verify_summary,
    },

    speed_advisory: {
      enabled: true,
      cached_validation_advisory_only: buildProcess.capabilities.cached_validation_advisory_only,
      impact_speed_decision_advisory: buildProcess.capabilities.impact_speed_decision_advisory,
      validation_skipped: false,
    },

    health: {
      phase3b_ready: manifest.readiness.phase3b_ready,
      blocking_reasons: manifest.readiness.blocking_reasons,
      route_count: sprint.route_contracts.route_count,
      planned_stage_count: sprint.orchestration.planned_stage_count,
    },

    orchestration: sprint.orchestration,
    route_contracts: sprint.route_contracts,
  };
}


