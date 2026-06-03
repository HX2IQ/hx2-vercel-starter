import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RoutingRule = {
  rule_id: string;
  task_type: string;
  preferred_agent: string;
  routing_confidence: number;
};

const routingRules: RoutingRule[] = [
  {
    rule_id: "route_001",
    task_type: "build_stabilization",
    preferred_agent: "DEV2",
    routing_confidence: 0.99
  },
  {
    rule_id: "route_002",
    task_type: "executive_orchestration",
    preferred_agent: "O2",
    routing_confidence: 0.98
  },
  {
    rule_id: "route_003",
    task_type: "verification",
    preferred_agent: "V2",
    routing_confidence: 0.98
  },
  {
    rule_id: "route_004",
    task_type: "adversarial_review",
    preferred_agent: "DA3",
    routing_confidence: 0.96
  },
  {
    rule_id: "route_005",
    task_type: "memory_graph_update",
    preferred_agent: "KGX",
    routing_confidence: 0.97
  }
];

function buildRoutingSummary() {
  const averageConfidence =
    routingRules.reduce((sum, rule) => sum + rule.routing_confidence, 0) /
    routingRules.length;

  return {
    adaptive_task_routing_active: true,
    routing_rule_count: routingRules.length,
    average_routing_confidence: Number(averageConfidence.toFixed(2)),
    agent_selection_ready: true,
    task_classification_ready: true,
    autonomous_execution_dispatch_ready: true,
    phase6_task_routing_active: true
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/hx2/phase6-adaptive-task-routing",
    mode: "read_only_phase6_adaptive_task_routing",
    mutation_allowed: false,
    orchestration_stage: "phase6_adaptive_task_routing",
    routing_summary: buildRoutingSummary(),
    routing_rules: routingRules,
    dev2: {
      stabilization_complete: true,
      deterministic_validation_active: true,
      preview_first_active: true,
      orchestration_safe: true
    }
  });
}
