import { NextResponse } from "next/server";
import { sprintNextStageRegistry } from "../_lib/sprint-next-stage-registry";
import { buildStageRegistryIntegrity } from "../_lib/sprint-next-stage-registry-integrity";
import { validateSprintNextStageRegistry } from "../_lib/registry-driven-orchestration-validation";

export async function GET() {
  const integrity = buildStageRegistryIntegrity();
  const validation = validateSprintNextStageRegistry();

  return NextResponse.json({
    ok: true,
    stage_registry: sprintNextStageRegistry,
    stage_registry_integrity: integrity,
    stage_registry_validation: validation,
    phase: "phase_3_deterministic_orchestration_core"
  });
}
