type CacheEntry = {
  ts: number;
  data: any[];
};

let cache: CacheEntry | null = null;

export function getCachedRss(maxAgeMs = 10 * 60 * 1000) {
  if (!cache) return null;

  const age = Date.now() - cache.ts;
  if (age > maxAgeMs) return null;

  return cache.data;
}

export function setCachedRss(data: any[]) {
  cache = {
    ts: Date.now(),
    data
  };
}
