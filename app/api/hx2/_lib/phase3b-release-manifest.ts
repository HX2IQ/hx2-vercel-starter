import { getPhase3BOrchestrationStatusSnapshot } from "./phase3b-orchestration-status";
import { getPhase3BRouteMatrix } from "./phase3b-route-matrix";

export function getPhase3BReleaseManifest() {
  const status = getPhase3BOrchestrationStatusSnapshot();
  const routeMatrix = getPhase3BRouteMatrix();

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
    build_health_route: "/api/hx2/phase3b-build-health",
    readiness: status.readiness,
    route_matrix: {
      route_count: routeMatrix.routes.length,
      matrix_mode: routeMatrix.matrix_mode,
      routes: routeMatrix.routes,
    },
    summary: {
      compiler_ready: status.compiler.ready,
      dependencies_ready: status.dependencies.ready,
      graph_ready: status.graph.ready,
      execution_plan_ready: status.execution_plan.ready,
      planned_stage_count: status.execution_plan.planned_stage_count,
    },
  };
}


