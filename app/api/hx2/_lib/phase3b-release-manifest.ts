import { getPhase3BOrchestrationStatusSnapshot } from "./phase3b-orchestration-status";

export function getPhase3BReleaseManifest() {
  const status = getPhase3BOrchestrationStatusSnapshot();

  return {
    ok: status.ok === true,
    manifest_id: "hx2-phase3b-release-manifest",
    phase: "phase_3b",
    release_mode: "deterministic_orchestration_preview",
    composition_mutation_allowed: false,
    status_route: "/api/hx2/phase3b-orchestration-status",
    compiler_route: "/api/hx2/orchestration-compiler",
    dependency_route: "/api/hx2/orchestration-stage-dependencies",
    graph_route: "/api/hx2/orchestration-stage-graph",
    execution_plan_route: "/api/hx2/orchestration-execution-plan",
    readiness: status.readiness,
    summary: {
      compiler_ready: status.compiler.ready,
      dependencies_ready: status.dependencies.ready,
      graph_ready: status.graph.ready,
      execution_plan_ready: status.execution_plan.ready,
      planned_stage_count: status.execution_plan.planned_stage_count,
    },
  };
}
