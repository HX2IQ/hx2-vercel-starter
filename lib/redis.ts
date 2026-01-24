import { Redis } from "@upstash/redis";

// Shared redis client for routes that import "@/lib/redis"
export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Optional legacy export: `import { redis } from "@/lib/redis"`
export const redis = getRedis() as unknown as Redis;

export async function redisSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}
