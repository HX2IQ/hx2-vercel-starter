import { Redis } from "@upstash/redis";

function trim(s?: string) {
  return (s ?? "").trim();
}

function stripSlash(s: string) {
  return s.replace(/\/+$/, "");
}

/**
 * Lazy Redis accessor.
 * IMPORTANT: Do NOT create Redis at module-load/build time.
 * Call getRedis() inside request handlers only.
 */
export function getRedis(): Redis | null {
  const url = stripSlash(trim(process.env.UPSTASH_REDIS_REST_URL));
  const token = trim(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Safe wrapper for Redis calls.
 */
export async function redisSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}