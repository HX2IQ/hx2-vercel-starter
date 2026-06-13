function getItemAgeDays(item: any): number | null {
  const rawDate =
    String(item?.pubDate || item?.published || item?.isoDate || "").trim();

  if (!rawDate) {
    return null;
  }

  const timestamp =
    Date.parse(rawDate);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const ageMs =
    Date.now() - timestamp;

  return ageMs / (1000 * 60 * 60 * 24);
}

function recencyScore(item: any, wantsFresh: boolean): number {
  if (!wantsFresh) {
    return 0;
  }

  const ageDays =
    getItemAgeDays(item);

  if (ageDays === null) {
    return -4;
  }

  if (ageDays <= 2) return 32;
  if (ageDays <= 7) return 28;
  if (ageDays <= 14) return 22;
  if (ageDays <= 30) return 16;
  if (ageDays <= 60) return 8;
  if (ageDays <= 90) return 3;
  if (ageDays <= 180) return -10;

  return -25;
}

export function scoreRssItems(items: any[], query: string) {
  const q = String(query || "").toLowerCase();

  const wantsFresh =
    /latest|today|news|current|recent|update|updates|market/.test(q);

  const terms = q
    .split(/\s+/)
    .map(x => x.trim())
    .filter(x => x.length > 2)
    .filter(x => !["the", "and", "for", "with", "what", "give", "latest", "current", "news", "market", "update"].includes(x));

  return items
    .map((item) => {
      const title = String(item.title || "").toLowerCase();
      const source = String(item.source || "").toLowerCase();

      let score = 0;

      for (const term of terms) {
        if (title.includes(term)) score += 3;
        if (source.includes(term)) score += 1;
      }

      if (/xrp|ripple|xrpl/.test(q) && /xrp|ripple|xrpl/.test(title)) score += 10;
      if (/bitcoin|btc/.test(q) && /bitcoin|btc/.test(title)) score += 10;
      if (/dtcc/.test(q) && /dtcc/.test(title)) score += 10;

      if (/crypto|bitcoin|ethereum|solana|xrp|ripple|xrpl/.test(q) && /crypto|bitcoin|ethereum|solana|xrp|ripple|xrpl/.test(title)) {
        score += 4;
      }

      if (wantsFresh) {
        score += 4;
        score += recencyScore(item, wantsFresh);
      }

      if (/coindesk|cointelegraph|cnbc|reuters|bloomberg|decrypt|the block|ripple\.com|xrpl\.org/.test(source)) {
        score += 8;
      }

      return {
        ...item,
        relevance_score: score
      };
    })
    .sort((a, b) => b.relevance_score - a.relevance_score);
}
