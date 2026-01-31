import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    node: "h2-oi",
    mode: "SAFE",
    status: "online",
    brain_attached: false,
    ip_firewall: true,
    ts: new Date().toISOString(),
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
