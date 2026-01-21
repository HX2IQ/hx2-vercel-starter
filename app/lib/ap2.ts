import crypto from "crypto";

export function requireAuth(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const expected = (process.env.HX2_API_KEY || "").trim();
  if (!token || !expected || token !== expected) {
    return { ok: false as const, status: 401, body: { ok: false, error: "unauthorized" } };
  }
  return { ok: true as const, token };
}

export function newTaskId(prefix: string) {
  const rand = crypto.randomBytes(4).toString("hex");
  return `${prefix}-${Date.now()}-${rand}`;
}

export async function enqueueAP2(taskType: string, payload: any) {
  const base = (process.env.HX2_BASE_URL || "https://optinodeiq.com").replace(/\/+$/, "");
  const url = `${base}/api/ap2/task/enqueue`;

  const body = {
    taskType,
    id: newTaskId(taskType.replace(/\./g, "-")),
    payload: payload || {},
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.HX2_API_KEY || ""}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) {
    return { ok: false as const, status: res.status, json };
  }
  return { ok: true as const, json };
}
