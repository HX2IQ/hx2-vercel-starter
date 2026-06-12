export type UnifiedRetrievalSource = {
  title: string;
  url?: string;
  source: string;
  snippet?: string;
};

export type UnifiedRetrievalContext = {
  query: string;
  web_results: UnifiedRetrievalSource[];
  memory_results: UnifiedRetrievalSource[];
  sources: UnifiedRetrievalSource[];
  retrieval_active: boolean;
  retrieval_mode: "stub" | "live";
};

async function fetchWikipedia(query: string): Promise<UnifiedRetrievalSource[]> {
  try {
    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

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
        title: String(json?.title || query),
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

  const wikiResults =
    await fetchWikipedia(query);

  return {
    query,
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
