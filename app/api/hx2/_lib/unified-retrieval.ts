import { fetchRssFeeds } from "./rss-fetch";

export type UnifiedRetrievalSource = {
  title: string;
  url?: string;
  source: string;
  snippet?: string;
};

export type UnifiedRetrievalContext = {
  query: string;
  normalized_query: string;
  web_results: UnifiedRetrievalSource[];
  memory_results: UnifiedRetrievalSource[];
  sources: UnifiedRetrievalSource[];
  retrieval_active: boolean;
  retrieval_mode: "stub" | "live";
};

function normalizeRetrievalQuery(query: string): string {
  let q = String(query || "").trim();

  q = q.replace(/[?!.,;:]+$/g, "");
  q = q.replace(/^(what|who|where|when|why|how)\s+(is|are|was|were|do|does|did)\s+/i, "");
  q = q.replace(/^(what|who|where|when|why|how)\s+/i, "");
  q = q.replace(/\s+/g, " ").trim();
  q = q.replace(/^the\s+/i, "").trim();

  const known: Record<string, string> = {
    "xrp": "XRP Ledger",
    "ripple": "XRP Ledger",
    "bitcoin": "Bitcoin",
    "btc": "Bitcoin",
    "ethereum": "Ethereum",
    "eth": "Ethereum",
    "dtcc": "Depository Trust & Clearing Corporation",
    "elon musk": "Elon Musk"
  };

  const lower = q.toLowerCase();
  return known[lower] || q || query;
}

async function fetchWikipedia(query: string): Promise<UnifiedRetrievalSource[]> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const json = await res.json();

    if (!json?.extract) return [];

    return [{
      title: String(json?.title || query),
      url: String(json?.content_urls?.desktop?.page || ""),
      source: "wikipedia",
      snippet: String(json?.extract || "")
    }];
  } catch {
    return [];
  }
}


function normalizedRelevanceTerms(query: string): string[] {
  const q = String(query || "").toLowerCase();

  if (/\bxrp\b|ripple|xrpl/.test(q)) {
    return ["xrp", "ripple", "xrpl"];
  }

  if (/bitcoin|\bbtc\b/.test(q)) {
    return ["bitcoin", "btc"];
  }

  if (/ethereum|\beth\b/.test(q)) {
    return ["ethereum", "eth"];
  }

  if (/dtcc|depository trust|clearing corporation/.test(q)) {
    return ["dtcc", "depository", "clearing"];
  }

  return q
    .split(/\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 3);
}

async function fetchRssRetrieval(query: string): Promise<UnifiedRetrievalSource[]> {
  try {
    const items =
      await fetchRssFeeds(query);

    const strictTerms = normalizedRelevanceTerms(query);

    const relevantItems = (items || []).filter((item: any) => {
      const haystack = `${item?.title || ""} ${item?.link || ""} ${item?.source || ""}`.toLowerCase();

      if (strictTerms.length === 0) {
        return false;
      }

      return strictTerms.some((term) => haystack.includes(term));
    });

    return relevantItems.slice(0, 5).map((item: any) => ({
      title: String(item?.title || "RSS result"),
      url: String(item?.link || ""),
      source: "rss",
      snippet: [
        item?.title ? `Title: ${item.title}` : "",
        item?.pubDate ? `Published: ${item.pubDate}` : "",
        item?.source ? `Feed: ${item.source}` : ""
      ].filter(Boolean).join(" | ")
    }));
  } catch {
    return [];
  }
}

export async function retrieveContext(
  query: string
): Promise<UnifiedRetrievalContext> {

  const normalized =
    normalizeRetrievalQuery(query);

  const [
    wikiResults,
    rssResults
  ] = await Promise.all([
    fetchWikipedia(normalized),
    fetchRssRetrieval(normalized)
  ]);

  const allSources = [
    ...wikiResults,
    ...rssResults
  ];

  return {
    query,
    normalized_query: normalized,
    web_results: allSources,
    memory_results: [],
    sources: allSources,
    retrieval_active: true,
    retrieval_mode:
      allSources.length > 0
        ? "live"
        : "stub"
  };
}


