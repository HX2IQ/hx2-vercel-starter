export function getPhase3BRouteMatrix() {
  return {
    ok: true,
    matrix_id: "hx2-phase3b-route-matrix",
    phase: "phase_3b",
    matrix_mode: "read_only_contract",
    composition_mutation_allowed: false,
    routes: [
      {
        route: "/api/hx2/orchestration-compiler",
        contract: "compiler_snapshot",
        expected_mode: "read_only_preview",
      },
      {
        route: "/api/hx2/orchestration-stage-dependencies",
        contract: "dependency_registry",
        expected_mode: "read_only_preview",
      },
      {
        route: "/api/hx2/orchestration-stage-graph",
        contract: "stage_graph_snapshot",
        expected_mode: "read_only_preview",
      },
      {
        route: "/api/hx2/orchestration-execution-plan",
        contract: "execution_plan_snapshot",
        expected_mode: "read_only_preview",
      },
      {
        route: "/api/hx2/phase3b-orchestration-status",
        contract: "phase3b_status_snapshot",
        expected_mode: "read_only_snapshot",
      },
      {
        route: "/api/hx2/phase3b-release-manifest",
        contract: "phase3b_release_manifest",
        expected_mode: "deterministic_orchestration_preview",
      },
          {
        route: "/api/hx2/phase3b-route-matrix",
        contract: "phase3b_route_matrix",
        expected_mode: "read_only_contract",
      },
          {
        route: "/api/hx2/phase3b-route-contract-summary",
        contract: "phase3b_route_contract_summary",
        expected_mode: "read_only_contract_summary",
      },
          {
        route: "/api/hx2/phase3b-sprint-snapshot",
        contract: "phase3b_sprint_snapshot",
        expected_mode: "read_only_sprint_snapshot",
      },
          {
        route: "/api/hx2/phase3b-build-health",
        contract: "phase3b_build_health",
        expected_mode: "read_only_build_health",
      },
    ],
  };
}




