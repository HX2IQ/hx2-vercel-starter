
import type { Hit } from "./searchRouter";
const BASE = "https://google.serper.dev/search";
export async function serperSearch(q: string, n: number = 5): Promise<Hit[]>{
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("SERPER_API_KEY missing");
  const r = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": key },
    body: JSON.stringify({ q, num: Math.min(10, Math.max(1, n)) })
  });
  if (!r.ok) throw new Error(`Serper ${r.status}`);
  const j = await r.json();
  const items = (j.organic || []) as any[];
  return items.map(it => ({ title: it.title, link: it.link, snippet: it.snippet })) as Hit[];
}
