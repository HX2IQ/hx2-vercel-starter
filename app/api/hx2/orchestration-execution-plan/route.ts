import { NextResponse } from "next/server";
import { getOrchestrationExecutionPlanSnapshot } from "../_lib/orchestration-execution-plan";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getOrchestrationExecutionPlanSnapshot();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/orchestration-execution-plan",
  });
}
