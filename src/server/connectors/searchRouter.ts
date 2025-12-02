
export type Hit = { title: string; link: string; snippet?: string };
export type Provider = "google" | "bing" | "serper";
type Circuit = { openUntil: number; p95: number; fails: number };
const CIRCUIT: Record<Provider, Circuit> = {
  google: { openUntil: 0, p95: 800, fails: 0 },
  bing:   { openUntil: 0, p95: 900, fails: 0 },
  serper: { openUntil: 0, p95: 950, fails: 0 }
};
const TIMEOUT_MS = 2500;
const OPEN_MS = 5 * 60 * 1000;
function circuitClosed(p: Provider) { return Date.now() > CIRCUIT[p].openUntil; }
function openCircuit(p: Provider)   { CIRCUIT[p].openUntil = Date.now() + OPEN_MS; }
async function withTimeout<T>(task: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([ task, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)) ]);
}
import { googleSearch } from "./googleSearch";
import { bingSearch } from "./bingSearch";
import { serperSearch } from "./serperSearch";
const PROVIDERS: Record<Provider, (q: string, n?: number) => Promise<Hit[]>> = {
  google: (q,n) => googleSearch(q, n ?? 5),
  bing:   (q,n) => bingSearch(q, n ?? 5),
  serper: (q,n) => serperSearch(q, n ?? 5),
};
export async function fastSearch(q: string, n = 5): Promise<Hit[]> {
  const order = (["google","bing","serper"] as Provider[]).filter(circuitClosed).sort((a,b) => CIRCUIT[a].p95 - CIRCUIT[b].p95);
  const runners = order.map(async (p) => {
    try {
      const t0 = Date.now();
      const hits = await withTimeout(PROVIDERS[p](q, n), TIMEOUT_MS);
      const dt = Date.now() - t0;
      CIRCUIT[p].p95 = Math.round(0.9 * CIRCUIT[p].p95 + 0.1 * dt);
      CIRCUIT[p].fails = 0;
      return { p, hits };
    } catch {
      CIRCUIT[p].fails++;
      if (CIRCUIT[p].fails >= 3) openCircuit(p);
      return { p, hits: [] as Hit[] };
    }
  });
  const first = await Promise.race(runners);
  if (first.hits.length) return dedupe(first.hits, n);
  const all = await Promise.allSettled(runners);
  const merged = dedupe(all.flatMap(r => r.status === "fulfilled" ? r.value.hits : []), n);
  return merged;
}
function dedupe(items: Hit[], n: number): Hit[] {
  const seen = new Set<string>();
  const out: Hit[] = [];
  for (const h of items) {
    try {
      const u = new URL(h.link);
      const key = u.hostname + u.pathname;
      if (!seen.has(key)) { seen.add(key); out.push(h); }
      if (out.length >= n) break;
    } catch {}
  }
  return out;
}
