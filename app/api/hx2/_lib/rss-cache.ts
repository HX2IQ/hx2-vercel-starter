type CacheEntry = {
  ts: number;
  data: any[];
};

const cache = new Map<string, CacheEntry>();

function normalizeCacheKey(query = "") {
  return String(query || "default")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function getCachedRss(query = "", maxAgeMs = 10 * 60 * 1000) {
  const key = normalizeCacheKey(query);
  const entry = cache.get(key);

  if (!entry) return null;

  const age = Date.now() - entry.ts;
  if (age > maxAgeMs) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedRss(query = "", data: any[]) {
  const key = normalizeCacheKey(query);

  cache.set(key, {
    ts: Date.now(),
    data
  });
}
