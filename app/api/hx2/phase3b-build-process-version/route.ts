import { NextResponse } from "next/server";
import { getPhase3BBuildProcessVersion } from "../_lib/phase3b-build-process-version";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BBuildProcessVersion();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-build-process-version",
  });
}
