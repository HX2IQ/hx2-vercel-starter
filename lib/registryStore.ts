import { redisGet, redisSet } from "./redisSimple";

export type RegistryNode = {
  id: string;
  type?: string;
  owner?: boolean;
  version?: string;
  qidc?: string;
  description?: string;
  constraints?: Record<string, any>;
};

const KEY = "hx2:registry:nodes";

function getRedisUrl(): string | null {
  const u = process.env.REDIS_URL || process.env.HX2_REDIS_URL;
  return u && u.trim().length ? u.trim() : null;
}

export async function loadNodes(): Promise<RegistryNode[]> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return [];
  const raw = await redisGet(redisUrl, KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveNodes(nodes: RegistryNode[]): Promise<boolean> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return false;
  return await redisSet(redisUrl, KEY, JSON.stringify(nodes));
}

export async function upsertNode(node: RegistryNode): Promise<{ ok: boolean; count: number }> {
  const nodes = await loadNodes();
  const idx = nodes.findIndex(n => n?.id === node.id);
  if (idx >= 0) nodes[idx] = { ...nodes[idx], ...node };
  else nodes.push(node);
  const ok = await saveNodes(nodes);
  return { ok, count: nodes.length };
}
