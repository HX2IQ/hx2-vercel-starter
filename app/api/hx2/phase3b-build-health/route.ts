import { NextResponse } from "next/server";
import { getPhase3BBuildHealthSnapshot } from "../_lib/phase3b-build-health-snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BBuildHealthSnapshot();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-build-health",
  });
}
