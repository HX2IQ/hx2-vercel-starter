import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function j(status: number, obj: any) {
  return NextResponse.json(obj, { status, headers: { "x-chat-route-version": "ap2-status-forward-v1" } });
}

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get("taskId") || "";
    if (!taskId) return j(400, { ok: false, error: "taskId is required" });

    const Gateway = (process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com").replace(/\/+$/, "");
    const url = `${Gateway}/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    const r = await fetch(url, {
      method: "GET",
      headers: { "accept": "application/json" },
      signal: controller.signal
    }).finally(() => clearTimeout(t));

    const ct = r.headers.get("content-type") || "";
    const text = await r.text();

    if (!ct.includes("application/json")) {
      return j(502, { ok: false, error: "Gateway returned non-JSON", http: r.status, contentType: ct, bodyFirst300: text.slice(0, 300) });
    }

    let data: any = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, {
      status: r.status,
      headers: { "x-chat-route-version": "ap2-status-forward-v1" }
    });
  } catch (e: any) {
    const msg = (e?.name === "AbortError") ? "Gateway status timeout" : (e?.message || String(e));
    return j(504, { ok: false, error: msg });
  }
}
