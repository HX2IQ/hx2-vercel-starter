/**
 * Persistent registry store (SAFE, infra-only).
 * Stores node registry in Redis under a single key.
 * No brain logic; only config metadata.
 */
import { createClient } from "redis";

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

let _client: ReturnType<typeof createClient> | null = null;

function redisUrl() {
  // Support either explicit REDIS_URL or Upstash-style URL env.
  return (
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_REST_URL || // if you later swap to REST client
    process.env.UPSTASH_REDIS_URL
  );
}

async function getClient() {
  if (_client) return _client;
  const url = redisUrl();
  if (!url) throw new Error("missing_redis_url");
  const client = createClient({ url });
  client.on("error", () => {});
  await client.connect();
  _client = client;
  return client;
}

export async function listNodes(): Promise<NodeRecord[]> {
  const client = await getClient();
  const raw = await client.get(REGISTRY_KEY);
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
  const client = await getClient();
  const nodes = await listNodes();
  const idx = nodes.findIndex((n) => n.id === node.id);

  const record: NodeRecord = {
    ...node,
    createdAt: idx >= 0 ? nodes[idx].createdAt : (node.createdAt ?? now),
    updatedAt: now,
  };

  if (idx >= 0) nodes[idx] = record;
  else nodes.push(record);

  await client.set(REGISTRY_KEY, JSON.stringify(nodes));
}

export async function seedDefaults(defaults: NodeRecord[]) {
  const nodes = await listNodes();
  if (nodes.length > 0) return;
  const now = new Date().toISOString();
  const seeded = defaults.map((n) => ({ ...n, createdAt: now, updatedAt: now }));
  const client = await getClient();
  await client.set(REGISTRY_KEY, JSON.stringify(seeded));
}
