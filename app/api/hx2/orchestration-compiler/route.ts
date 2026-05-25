import { NextResponse } from "next/server";
import { getOrchestrationCompilerSnapshot } from "../_lib/orchestration-compiler";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getOrchestrationCompilerSnapshot();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/orchestration-compiler",
  });
}
