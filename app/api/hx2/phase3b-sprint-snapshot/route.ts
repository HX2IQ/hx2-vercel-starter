import { NextResponse } from "next/server";
import { getPhase3BSprintSnapshot } from "../_lib/phase3b-sprint-snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BSprintSnapshot();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-sprint-snapshot",
  });
}
