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

  const known: Record<string, string> = {
    "xrp": "XRP",
    "ripple": "XRP",
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
    const normalized =
      normalizeRetrievalQuery(query);

    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normalized)}`;

    const res = await fetch(url, {
      cache: "no-store"
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();

    if (!json?.extract) {
      return [];
    }

    return [
      {
        title: String(json?.title || normalized),
        url: String(json?.content_urls?.desktop?.page || ""),
        source: "wikipedia",
        snippet: String(json?.extract || "")
      }
    ];
  } catch {
    return [];
  }
}

export async function retrieveContext(
  query: string
): Promise<UnifiedRetrievalContext> {

  const normalized =
    normalizeRetrievalQuery(query);

  const wikiResults =
    await fetchWikipedia(normalized);

  return {
    query,
    normalized_query: normalized,
    web_results: wikiResults,
    memory_results: [],
    sources: wikiResults,
    retrieval_active: true,
    retrieval_mode:
      wikiResults.length > 0
        ? "live"
        : "stub"
  };
}
