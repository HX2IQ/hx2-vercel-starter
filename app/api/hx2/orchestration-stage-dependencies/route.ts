import { NextResponse } from "next/server";

import {
  getOrchestrationStageDependencyRegistry,
  validateStageDependencies,
} from "../_lib/orchestration-stage-dependency-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const registry = getOrchestrationStageDependencyRegistry();
  const validation = validateStageDependencies();

  return NextResponse.json({
    ok: true,

    route: "/api/hx2/orchestration-stage-dependencies",

    dependency_registry: registry,

    validation,
  });
}
