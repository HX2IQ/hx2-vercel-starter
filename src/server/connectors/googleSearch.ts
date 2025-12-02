
export type GoogleHit = { title: string; link: string; snippet?: string };
const BASE = process.env.GOOGLE_SEARCH_BASE || "https://www.googleapis.com/customsearch/v1";

export async function googleSearch(q: string, num: number = 5){
  const key = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) throw new Error("GOOGLE_API_KEY or GOOGLE_CSE_ID missing");
  const url = new URL(BASE);
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", q);
  url.searchParams.set("num", String(Math.min(10, Math.max(1, num))));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`Google CSE ${r.status}`);
  const j = await r.json();
  const items = (j.items||[]) as any[];
  return items.map(it => ({ title: it.title, link: it.link, snippet: it.snippet })) as GoogleHit[];
}
