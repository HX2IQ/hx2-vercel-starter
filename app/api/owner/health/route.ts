import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function check(url: string) {
  const started = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    return {
      ok: res.ok,
      status: res.status,
      latency_ms: Date.now() - started,
      url,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      latency_ms: Date.now() - started,
      url,
      error: err?.message || String(err),
    };
  }
}

export async function GET() {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://optinodeiq.com";

    const checks = await Promise.all([
      check(`${base}/api/brain/status`),
      check(`${base}/api/owner/summary`),
      check(`${base}/api/owner/baselines`),
      check(`${base}/api/health`),
    ]);

    return NextResponse.json({
      ok: true,
      generated_at: new Date().toISOString(),
      checks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
