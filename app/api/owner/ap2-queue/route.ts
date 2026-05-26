import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const gateway = (process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com").replace(/\/+$/, "");

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${gateway}/api/ap2/status`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(t));

    const text = await res.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 500) };
    }

    return NextResponse.json({
      ok: res.ok,
      gateway,
      http_status: res.status,
      queue_status: data,
      checked_utc: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      gateway,
      error: err?.name === "AbortError" ? "AP2 gateway timeout" : err?.message || String(err),
      checked_utc: new Date().toISOString(),
    });
  }
}
