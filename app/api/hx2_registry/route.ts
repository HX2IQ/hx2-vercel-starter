import { NextResponse } from "next/server";
import { loadNodes } from "../../../lib/registryStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const nodes = await loadNodes();
  return NextResponse.json({
    ok: true,
    service: "hx2_registry",
    mode: "SAFE",
    nodes,
    ts: new Date().toISOString()
  }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
