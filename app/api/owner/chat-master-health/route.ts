import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://optinodeiq.com";

  const started = Date.now();

  try {
    const res = await fetch(`${base}/api/hx2/chat-master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_query: "Why is the sky blue?" }),
      cache: "no-store",
    });

    const latency_ms = Date.now() - started;
    const data = await res.json().catch(() => null);

    return NextResponse.json({
      ok: res.ok && data?.ok === true,
      http_status: res.status,
      latency_ms,
      chat_master_version: data?.chat_master_version || null,
      response_format_version: data?.response_format_version || null,
      synth_version: data?.synth_version || null,
      mode: data?.capability_decision?.mode || null,
      display_node: data?.display_node || null,
      error: data?.error || null,
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
