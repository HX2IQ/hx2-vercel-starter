import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    kgx_orchestration_map_active: true,
    canonical_orchestration_entrypoint: "/api/hx2/capability-planner",
    canonical_pipeline_preview: "/api/hx2/kgx-pipeline-preview",
    canonical_outcome_feedback: "/api/hx2/kgx-pipeline-outcome",
    canonical_layers: [
      "kgx_graph_context",
      "kgx_planner_influence",
      "kgx_execution_learning",
      "kgx_node_effectiveness",
      "kgx_adaptive_selection",
      "kgx_orchestration_assembly",
      "kgx_pipeline_persistence",
      "kgx_pipeline_outcome_feedback"
    ],
    legacy_or_diagnostic_routes: [
      "/api/hx2/orchestration-outcome",
      "/api/hx2/orchestration-outcome-summary",
      "/api/hx2/orchestration-execution-plan",
      "/api/hx2/runtime-intelligence-execution-planner",
      "/api/hx2/phase5-orchestration-state",
      "/api/hx2/phase6-autonomous-execution-planner"
    ],
    routing_policy: {
      new_planner_work: "must extend KGX canonical planner path",
      old_phase_routes: "read-only diagnostics unless explicitly migrated",
      no_duplicate_orchestration_engines: true
    }
  });
}
