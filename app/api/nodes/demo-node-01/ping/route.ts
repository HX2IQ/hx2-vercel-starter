import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    nodeId: "demo-node-01",
    route: "nodes.demo-node-01.ping",
    ts: new Date().toISOString(),
  });
}
