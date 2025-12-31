import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    service: "ap2_diagnostics",
    mode: "SAFE",
    status: "online",
    worker: "local-stub",
    ts: new Date().toISOString(),
  });
}











