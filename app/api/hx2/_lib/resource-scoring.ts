export function tokenizeForOverlap(text: string): string[] {
  const stop = new Set([
    "a","an","and","are","as","at","be","by","for","from","how","i","in","is","it","of","on","or","show","summarize","that","the","this","to","video","videos","watch","what","with","youtube"
  ]);

  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t));
}

export function countTokenOverlap(query: string, candidate: any): number {
  const qTokens = new Set(tokenizeForOverlap(query));
  const cTokens = new Set(
    tokenizeForOverlap(
      `${String(candidate?.title || "")} ${String(candidate?.excerpt || "")} ${String(candidate?.snippet || "")} ${String(candidate?.query || "")}`
    )
  );

  let overlap = 0;
  for (const tok of qTokens) {
    if (cTokens.has(tok)) overlap++;
  }
  return overlap;
}

export function scoreLiveWebResult(q: string, item: any): number {
  const query = String(q || "").trim().toLowerCase();
  const title = String(item?.title || "").trim().toLowerCase();
  const snippet = String(item?.snippet || "").trim().toLowerCase();

  const tokens = query.split(/\s+/).filter((t) => t.length >= 3);
  let score = 0;

  for (const tok of tokens) {
    if (title.includes(tok)) score += 4;
    if (snippet.includes(tok)) score += 2;
  }

  if (title.includes(query)) score += 8;
  if (snippet.includes(query)) score += 5;

  return score;
}
