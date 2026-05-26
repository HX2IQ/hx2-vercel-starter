import { NextResponse } from "next/server";
import { getPhase3BReleaseManifest } from "../_lib/phase3b-release-manifest";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getPhase3BReleaseManifest();

  return NextResponse.json({
    ...snapshot,
    route: "/api/hx2/phase3b-release-manifest",
  });
}
