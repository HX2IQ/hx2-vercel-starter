import type { NextRequest } from "next/server";

function ap2Base(): string {
  return (process.env.AP2_WORKER_BASE_URL || process.env.AP2_WORKER_BASE || "https://ap2-worker.optinodeiq.com").trim();
}

function authHeader(req: NextRequest): string | null {
  // Prefer incoming Authorization header; fallback to HX2_API_KEY env
  const incoming = req.headers.get("authorization");
  if (incoming && incoming.trim()) return incoming.trim();

  const k = (process.env.HX2_API_KEY || "").trim();
  if (!k) return null;
  return `Bearer ${k}`;
}

export async function ap2TaskEnqueueProxy(req: NextRequest, bodyAny: any) {
  const base = ap2Base();
  const auth = authHeader(req);
  if (!auth) return { ok: false, error: "unauthorized", message: "Missing Authorization and HX2_API_KEY." };

  const r = await fetch(`${base}/api/ap2/task/enqueue`, {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": auth },
    body: JSON.stringify(bodyAny ?? {})
  });

  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { ok: false, error: "bad_json", raw: text }; }

  return json;
}

export async function ap2TaskStatusProxy(req: NextRequest, taskId: string) {
  const base = ap2Base();
  const auth = authHeader(req);
  if (!auth) return { ok: false, error: "unauthorized", message: "Missing Authorization and HX2_API_KEY." };
  if (!taskId) return { ok: false, error: "missing_taskId", message: "Provide taskId." };

  const url = `${base}/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`;
  const r = await fetch(url, { method: "GET", headers: { "authorization": auth } });

  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { ok: false, error: "bad_json", raw: text }; }

  return json;
}
