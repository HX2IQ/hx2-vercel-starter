
import type { Hit } from "./searchRouter";
const BASE = "https://api.bing.microsoft.com/v7.0/search";
export async function bingSearch(q: string, n: number = 5): Promise<Hit[]>{
  const key = process.env.BING_API_KEY;
  if (!key) throw new Error("BING_API_KEY missing");
  const url = new URL(BASE);
  url.searchParams.set("q", q);
  url.searchParams.set("count", String(Math.min(10, Math.max(1, n))));
  const r = await fetch(url.toString(), { headers: { "Ocp-Apim-Subscription-Key": key } });
  if (!r.ok) throw new Error(`Bing ${r.status}`);
  const j = await r.json();
  const items = (j.webPages?.value || []) as any[];
  return items.map(it => ({ title: it.name, link: it.url, snippet: it.snippet })) as Hit[];
}
