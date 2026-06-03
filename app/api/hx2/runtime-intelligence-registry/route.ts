import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const registry = [
  {
    id: "runtime_intelligence_router",
    role: "routing",
    stage: "stable",
    orchestration_ready: true
  },
  {
    id: "token_economy_engine",
    role: "token_budgeting",
    stage: "stable",
    orchestration_ready: true
  },
  {
    id: "runtime_memory_pressure",
    role: "memory_management",
    stage: "stable",
    orchestration_ready: true
  },
  {
    id: "runtime_confidence_layer",
    role: "confidence_scoring",
    stage: "stable",
    orchestration_ready: true
  },
  {
    id: "runtime_verification_policy",
    role: "verification_governance",
    stage: "stable",
    orchestration_ready: true
  },
  {
    id: "runtime_response_mode_planner",
    role: "response_planning",
    stage: "stable",
    orchestration_ready: true
  },
  {
    id: "runtime_intelligence_arbitration",
    role: "reasoning_arbitration",
    stage: "stable",
    orchestration_ready: true
  }
];

export async function GET() {

  return NextResponse.json({
    ok: true,

    route: "/api/hx2/runtime-intelligence-registry",

    mode: "read_only_runtime_registry",

    mutation_allowed: false,

    orchestration_stage: "phase4_runtime_registry",

    registry,

    totals: {
      node_count: registry.length,
      orchestration_ready_count: registry.filter(
        (x) => x.orchestration_ready
      ).length
    },

    dev2: {
      deployment_stable: true,
      topology_verified: true,
      route_contract_verified: true
    }
  });
}
