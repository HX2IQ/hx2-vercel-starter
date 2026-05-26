import { NextResponse } from "next/server";
import { getPhase3BRouteMatrix } from "../_lib/phase3b-route-matrix";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BRouteMatrix();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-route-matrix",
  });
}
