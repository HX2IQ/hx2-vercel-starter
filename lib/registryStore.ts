import { getRedis, redisSafe } from "./redis";

export type RegistryNode = {
  id: string;
  type?: string;
  owner?: boolean;
  version?: string;
  qidc?: string;
  description?: string;
  constraints?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

const INDEX_KEY = "hx2:registry:nodes:index";
const NODE_KEY  = (id: string) => `hx2:registry:nodes:${id}`;

function requireRedis() {
  const r = getRedis();
  if (!r) throw new Error("Redis not configured: missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  return r;
}

export async function loadNodes(): Promise<RegistryNode[]> {
  const redis = requireRedis();

  const ids = await redisSafe(() => redis.smembers<string[]>(INDEX_KEY) as any, []);
  if (!ids || ids.length === 0) return [];

  const keys = ids.map((id) => NODE_KEY(id));
  const values = await redisSafe(() => redis.mget<any[]>(...keys) as any, []);

  return (values || [])
    .map((v: any) => {
      if (!v) return null;
      if (typeof v === "string") {
        try { return JSON.parse(v); } catch { return null; }
      }
      // Upstash REST may already return objects depending on client version/usage
      return v;
    })
    .filter(Boolean) as RegistryNode[];
}

// Optional: keep these for code that still calls upsert/save
export async function upsertNode(node: RegistryNode): Promise<{ ok: boolean; count: number }> {
  const redis = requireRedis();

  const now = new Date().toISOString();
  const record: RegistryNode = {
    ...node,
    id: node.id,
    createdAt: node.createdAt || now,
    updatedAt: now,
  };

  await redis.set(NODE_KEY(record.id), JSON.stringify(record));
  await redis.sadd(INDEX_KEY, record.id);

  const count = await redisSafe(() => redis.scard(INDEX_KEY) as any, 0);
  return { ok: true, count: Number(count) || 0 };
}

// Legacy no-op (old single-key list). Kept so old imports don’t crash.
export async function saveNodes(_nodes: RegistryNode[]): Promise<boolean> {
  // Intentionally deprecated: we store nodes by id + index set now.
  return true;
}

