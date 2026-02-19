/**
 * lib/ap2/tasks.ts
 * Minimal task persistence for HX2->AP2 enqueue/status.
 * - Prefers Upstash Redis REST if UPSTASH_REDIS_REST_URL/TOKEN are set
 * - Falls back to in-memory Map (non-persistent) for local/dev
 *
 * NOTE: This is "infra-only" plumbing. No HX2 brain logic here.
 */

export type Ap2TaskState = "ENQUEUED" | "RUNNING" | "DONE" | "FAILED" | "UNKNOWN";

export type Ap2TaskRecord = {
  id: string;
  taskType: string;
  payload: any;
  state: Ap2TaskState;
  createdAt: string;
  updatedAt: string;
  result?: any;
  error?: any;
};

const mem = new Map<string, Ap2TaskRecord>();

function nowIso() {
  return new Date().toISOString();
}

function genId(prefix = "t") {
  // good-enough unique id for now; can be swapped later
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function hasUpstash() {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
}

async function upstashFetch(path: string, init: RequestInit) {
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const url = base.endsWith("/") ? base.slice(0, -1) + path : base + path;

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "cache-control": "no-cache"
    }
  });

  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { ok: false, error: "upstash_non_json", text_head: text?.slice?.(0, 200) }; }

  if (!res.ok) {
    throw new Error(`upstash_http_${res.status}: ${text?.slice?.(0, 200)}`);
  }
  return json;
}

async function redisSet(key: string, value: any) {
  // Upstash Redis REST: /set/<key>/<value> (value must be URL-encoded string)
  const v = encodeURIComponent(JSON.stringify(value));
  return upstashFetch(`/set/${encodeURIComponent(key)}/${v}`, { method: "POST" });
}

async function redisGet(key: string) {
  const r = await upstashFetch(`/get/${encodeURIComponent(key)}`, { method: "POST" });
  // Upstash returns { result: "<string>" } for GET
  const raw = r?.result ?? null;
  if (raw == null) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

export async function createTask(taskType: string, payload: any = {}): Promise<Ap2TaskRecord> {
  const id = genId("ap2");
  const ts = nowIso();
  const rec: Ap2TaskRecord = {
    id,
    taskType,
    payload: payload ?? {},
    state: "ENQUEUED",
    createdAt: ts,
    updatedAt: ts
  };

  if (hasUpstash()) {
    await redisSet(`ap2:task:${id}`, rec);
  } else {
    mem.set(id, rec);
  }

  return rec;
}

export async function getTask(id: string): Promise<Ap2TaskRecord | null> {
  if (!id) return null;

  if (hasUpstash()) {
    const v = await redisGet(`ap2:task:${id}`);
    return (v && typeof v === "object") ? (v as Ap2TaskRecord) : null;
  }

  return mem.get(id) ?? null;
}

export async function updateTask(id: string, patch: Partial<Ap2TaskRecord>): Promise<Ap2TaskRecord | null> {
  const existing = await getTask(id);
  if (!existing) return null;

  const next: Ap2TaskRecord = {
    ...existing,
    ...patch,
    updatedAt: nowIso()
  };

  if (hasUpstash()) {
    await redisSet(`ap2:task:${id}`, next);
  } else {
    mem.set(id, next);
  }

  return next;
}