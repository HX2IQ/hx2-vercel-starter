import { NextResponse } from "next/server";
import { getPhase3BOrchestrationStatusSnapshot } from "../_lib/phase3b-orchestration-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BOrchestrationStatusSnapshot();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-orchestration-status",
  });
}
