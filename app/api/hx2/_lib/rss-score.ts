export function scoreRssItems(items: any[], query: string) {
  const q = String(query || "").toLowerCase();
  const terms = q
    .split(/\s+/)
    .map(x => x.trim())
    .filter(x => x.length > 2);

  return items
    .map((item) => {
      const title = String(item.title || "").toLowerCase();
      const source = String(item.source || "").toLowerCase();

      let score = 0;

      for (const term of terms) {
        if (title.includes(term)) score += 3;
        if (source.includes(term)) score += 1;
      }

      if (/xrp|ripple/.test(q) && /xrp|ripple/.test(title)) score += 5;
      if (/crypto|bitcoin|ethereum|solana|xrp/.test(q) && /crypto|bitcoin|ethereum|solana|xrp/.test(title)) score += 3;
      if (/latest|today|news|current|recent/.test(q)) score += 2;

      return {
        ...item,
        relevance_score: score
      };
    })
    .sort((a, b) => b.relevance_score - a.relevance_score);
}
