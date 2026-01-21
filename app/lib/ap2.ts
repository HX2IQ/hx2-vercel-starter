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

function normalizeBase(raw: string | undefined) {
  const v = (raw || "").trim();

  // If missing or clearly not a host/url, fall back to production base.
  // (The long hex you’re seeing is likely a Vercel internal value.)
  if (!v || /^[a-f0-9]{32,64}$/i.test(v)) return "https://optinodeiq.com";

  // If already has scheme, keep it.
  if (/^https?:\/\//i.test(v)) return v.replace(/\/+$/, "");

  // If looks like a host (contains dot), add https://
  if (v.includes(".")) return ("https://" + v).replace(/\/+$/, "");

  // Otherwise fallback.
  return "https://optinodeiq.com";
}

export async function enqueueAP2(taskType: string, payload: any) {
  const base = normalizeBase(process.env.HX2_BASE_URL);
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
