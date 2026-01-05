import { NextResponse } from "next/server";

export async function GET() {
  const base =
    process.env.AP2_GATEWAY_BASE_URL ||
    process.env.HX2_GATEWAY_BASE_URL ||
    process.env.GATEWAY_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { ok: false, error: "Missing gateway base URL env var (AP2_GATEWAY_BASE_URL or HX2_GATEWAY_BASE_URL)" },
      { status: 500 }
    );
  }

  const url = `${base.replace(/\/+$/, "")}/api/brain/health`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    cache: "no-store"
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, upstream_status: res.status }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
