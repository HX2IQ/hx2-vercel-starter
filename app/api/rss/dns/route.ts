import { NextRequest, NextResponse } from "next/server";
import * as dns from "node:dns/promises";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();
  try {
    const body = await req.json().catch(() => ({}));
    const host = String(body?.host || "").trim();
    if (!host) return NextResponse.json({ ok: false, started, error: "Missing host" }, { status: 400 });

    const addrs = await dns.lookup(host, { all: true });
    return NextResponse.json({ ok: true, started, host, addrs });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, started, error: String(e?.message || e), name: e?.name || null, cause: e?.cause ? String(e.cause) : null },
      { status: 500 }
    );
  }
}