import { NextRequest, NextResponse } from "next/server";
import { routeRuntimeIntelligence } from "../_lib/runtime-intelligence-router";

export const dynamic = "force-dynamic";

function parseBoolean(value: string | null): boolean {
  return value === "true" || value === "1" || value === "yes";
}

function parseComplexity(value: string | null): number {
  const parsed = Number(value ?? "5");

  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.max(1, Math.min(10, parsed));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const input = {
    complexity_score: parseComplexity(searchParams.get("complexity")),
    mission_critical: parseBoolean(searchParams.get("mission_critical")),
    repeated_query: parseBoolean(searchParams.get("repeated_query")),
  };

  const routing_decision = routeRuntimeIntelligence(input);

  return NextResponse.json({
    ok: true,
    route: "/api/hx2/runtime-intelligence-route",
    mode: "read_only_runtime_intelligence_route",
    mutation_allowed: false,
    input,
    routing_decision,
  });
}
