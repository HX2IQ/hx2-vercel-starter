import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  const started = Date.now();

  try {
    const res = await fetch(`${base}/api/brain/memory/status`, {
      method: "GET",
      headers: { "x-hx2-session": "owner-console" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json({
      ok: res.ok && data?.ok !== false,
      http_status: res.status,
      latency_ms: Date.now() - started,
      forwarded: data?.forwarded ?? false,
      upstream_status: data?.upstream_status ?? null,
      url: data?.url ?? null,
      memory_status: data?.data ?? data ?? {},
      checked_utc: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err),
      latency_ms: Date.now() - started,
      checked_utc: new Date().toISOString(),
    });
  }
}
