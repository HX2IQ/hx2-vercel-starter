import { NextResponse } from "next/server";
import { getOrchestrationStageGraphSnapshot } from "../_lib/orchestration-stage-graph";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getOrchestrationStageGraphSnapshot();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/orchestration-stage-graph",
  });
}
