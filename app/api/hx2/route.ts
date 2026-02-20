import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getCommand(body: any) {
  return body?.command ?? body?.task ?? body?.action ?? null;
}

function getOrigin(req: NextRequest) {
  // In Next.js route handlers, req.url is absolute
  try { return new URL(req.url).origin; } catch { return ""; }
}

function getAuthHeader(req: NextRequest) {
  const incoming = req.headers.get("authorization");
  if (incoming && incoming.trim()) return incoming.trim();
  const k = (process.env.HX2_API_KEY || "").trim();
  if (k) return `Bearer ${k}`;
  return "";
}

function jsonOk(command: any, data: any, headers?: Record<string,string>) {
  return NextResponse.json({ ok: true, command, data }, { headers });
}

function jsonErr(command: any, error: string, message: string, extra?: any, status: number = 400, headers?: Record<string,string>) {
  return NextResponse.json({ ok: false, error, message, extra }, { status, headers });
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch {}

  const command = getCommand(body);
  const headers = { "x-hx2-route-version": "hx2-ap2-proxy-v4" };

  if (!command) return jsonErr(command, "missing_command", "Provide command.", null, 400, headers);

  // Basic checks
  if (command === "ping" || command === "hx2.ping") {
    return jsonOk(command, { pong: true }, headers);
  }

  if (command === "env.check") {
    const ap2 = (process.env.AP2_WORKER_BASE_URL || "").trim();
    return jsonOk(command, {
      AP2_WORKER_BASE_URL: ap2 || null,
      hasAP2: !!ap2,
      note: "AP2_WORKER_BASE_URL is used for worker status only. Task enqueue/status are proxied to same-origin /api/ap2/*.",
    }, headers);
  }

  // Worker status (this is the only thing that should hit ap2-worker)
  if (command === "ap2.status") {
    const workerBase = (process.env.AP2_WORKER_BASE_URL || "").trim();
    if (!workerBase || !/^https?:\/\//i.test(workerBase)) {
      return jsonErr(command, "missing_ap2_worker_base_url", "AP2_WORKER_BASE_URL is not set (or not http/https).", null, 500, headers);
    }

    const payload = body?.args ?? body ?? {};
    try {
      const res = await fetch(`${workerBase}/api/ap2/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { ok: res.ok, command, data: { workerBase, http: res.status, data } },
        { status: res.ok ? 200 : 502, headers }
      );
    } catch (e: any) {
      return jsonErr(command, "ap2_fetch_failed", "Failed to reach AP2 worker (/api/ap2/status).", String(e?.message ?? e), 502, headers);
    }
  }

  // ------------------------------------------------------------
  // AP2 task wrapper: SAME-ORIGIN Vercel routes (authoritative)
  // ------------------------------------------------------------
  if (command === "ap2.task.enqueue") {
    const origin = getOrigin(req);
    if (!origin) return jsonErr(command, "no_origin", "Could not determine request origin.", null, 500, headers);

    const auth = getAuthHeader(req);
    if (!auth) return jsonErr(command, "missing_auth", "HX2_API_KEY not set and no Authorization header provided.", null, 500, headers);

    const taskType = body?.taskType ?? body?.type ?? body?.args?.taskType ?? null;
    const payload  = body?.payload ?? body?.args?.payload ?? {};
    const note     = body?.note ?? body?.args?.note ?? "";

    try {
      const res = await fetch(`${origin}/api/ap2/task/enqueue`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": auth,
        },
        body: JSON.stringify({ mode: body?.mode ?? "SAFE", taskType, payload, note }),
      });

      const data = await res.json().catch(() => ({} as any));

      // Normalize taskId no matter what shape comes back
      const taskId =
        data?.taskId ??
        data?.task?.taskId ??
        data?.task?.id ??
        data?.data?.taskId ??
        null;

      return jsonOk(command, { ...data, taskId }, headers);
    } catch (e: any) {
      return jsonErr(command, "enqueue_proxy_failed", "Failed proxying to /api/ap2/task/enqueue.", String(e?.message ?? e), 502, headers);
    }
  }

  if (command === "ap2.task.status") {
    const origin = getOrigin(req);
    if (!origin) return jsonErr(command, "no_origin", "Could not determine request origin.", null, 500, headers);

    const auth = getAuthHeader(req);
    if (!auth) return jsonErr(command, "missing_auth", "HX2_API_KEY not set and no Authorization header provided.", null, 500, headers);

    const taskId =
      body?.taskId ??
      body?.id ??
      body?.args?.taskId ??
      body?.args?.id ??
      null;

    if (!taskId) return jsonErr(command, "missing_taskId", "Provide taskId.", null, 400, headers);

    try {
      const res = await fetch(`${origin}/api/ap2/task/status?taskId=${encodeURIComponent(String(taskId))}`, {
        method: "GET",
        headers: { "authorization": auth },
      });

      const data = await res.json().catch(() => ({} as any));
      return jsonOk(command, data, headers);
    } catch (e: any) {
      return jsonErr(command, "status_proxy_failed", "Failed proxying to /api/ap2/task/status.", String(e?.message ?? e), 502, headers);
    }
  }

  return jsonErr(command, "not_implemented", "Command not implemented in hx2 route.", null, 400, headers);
}