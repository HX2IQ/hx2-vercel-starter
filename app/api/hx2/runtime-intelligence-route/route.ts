import { NextResponse } from "next/server";
import { routeRuntimeIntelligence } from "../_lib/runtime-intelligence-router";

export const dynamic = "force-dynamic";

export async function GET() {
  const sample = routeRuntimeIntelligence({
    complexity_score: 5,
    mission_critical: false,
    repeated_query: false
  });

  return NextResponse.json({
    ok: true,
    route: "/api/hx2/runtime-intelligence-route",
    mode: "read_only_runtime_intelligence_route",
    mutation_allowed: false,
    router: sample
  });
}
