/**
 * Persistent registry store (SAFE, infra-only).
 * Uses Upstash Redis REST (no node redis dependency).
 * No brain logic; only config metadata.
 */

type Json = Record<string, any>;
type NodeRecord = {
  id: string;
  type?: string;
  version?: string;
  owner?: boolean;
  displayName?: string;
  title?: string;
  description?: string;
  routes?: string[];
  endpoints?: { method: string; path: string; desc?: string }[];
  tags?: string[];
  constraints?: Json;
  createdAt?: string;
  updatedAt?: string;
};

const REGISTRY_KEY = "hx2:registry:nodes";

function restUrl() {
  return (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_REST_URL ||
    process.env.KV_REST_API_URL || // optional compatibility
    ""
  );
}

function restToken() {
  return (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN || // optional compatibility
    ""
  );
}

async function upstash(cmd: string, ...args: (string | number)[]) {
  const url = restUrl();
  const token = restToken();
  if (!url) throw new Error("missing_redis_rest_url");
  if (!token) throw new Error("missing_redis_rest_token");

  const full = `${url}/${cmd}/${args.map(a => encodeURIComponent(String(a))).join("/")}`;
  const r = await fetch(full, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // Upstash returns JSON like: { result: ... }
  const j = await r.json().catch(() => ({} as any));
  if (!r.ok) throw new Error(`redis_rest_http_${r.status}`);
  return j;
}

export async function listNodes(): Promise<NodeRecord[]> {
  const j = await upstash("get", REGISTRY_KEY);
  const raw = j?.result;

  if (!raw) return [];
  try {
    const nodes = JSON.parse(raw);
    return Array.isArray(nodes) ? nodes : [];
  } catch {
    return [];
  }
}

export async function upsertNode(node: NodeRecord): Promise<void> {
  const now = new Date().toISOString();
  const nodes = await listNodes();
  const idx = nodes.findIndex((n) => n.id === node.id);

  const record: NodeRecord = {
    ...node,
    createdAt: idx >= 0 ? nodes[idx].createdAt : (node.createdAt ?? now),
    updatedAt: now,
  };

  if (idx >= 0) nodes[idx] = record;
  else nodes.push(record);

  await upstash("set", REGISTRY_KEY, JSON.stringify(nodes));
}

export async function seedDefaults(defaults: NodeRecord[]) {
  const nodes = await listNodes();
  if (nodes.length > 0) return;
  const now = new Date().toISOString();
  const seeded = defaults.map((n) => ({ ...n, createdAt: now, updatedAt: now }));
  await upstash("set", REGISTRY_KEY, JSON.stringify(seeded));
}

function getRedisClient() {
  // NOTE: In local builds or CI, env vars may be missing. Return null and let callers fallback.
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  if (!token || !url) return null;
  return { token, url };
}

