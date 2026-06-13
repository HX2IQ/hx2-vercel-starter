import { fetchRssFeeds } from "./rss-fetch";
import { fetchChosenPageText } from "./page-fetch";

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


function shouldUseLiveWeb(query: string): boolean {
  const q = String(query || "").toLowerCase();

  return /\b(latest|current|today|news|recent|update|updates|search|look up|verify|source|sources|fresh|new|2026)\b/.test(q);
}


function decodeHtmlEntities(text: string): string {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match: string, code: string) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCharCode(n) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match: string, code: string) => {
      const n = parseInt(code, 16);
      return Number.isFinite(n) ? String.fromCharCode(n) : "";
    });
}

function cleanPageChrome(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/\b(Search|Menu|Markets|Tech|Policy|Business|Video|Videos|Podcast|Podcasts)\s*\/\s*/gi, " ")
    .replace(/\b(Berita Video|Harga|Riset|Acara|Data & Indeks|Bersponsor)\b/gi, " ")
    .replace(/\b(Make preferred on|Share Share this article|Share this article|Copy link|X icon|X \(Twitter\)|LinkedIn|Facebook|Email|Summary Show)\b/gi, " ")
    .replace(/\b(Disclosure & Polices|Disclosure & Policies|Disclosure|Privacy Policy|Terms of Use)\b/gi, " ")
    .replace(/\b(Play Now|Games By LinkedIn|Frase Unscramble The Anagram|Pinpoint Guess The Category|Queens Crown Each Region|Crossclimb Unlock A Trivia Ladder)\b/gi, " ")
    .replace(/\b\d+\s+min read\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function distillPageText(text: string): string {
  const raw =
    cleanPageChrome(text);

  if (!raw) {
    return "";
  }

  const noisePatterns = [
    /subscribe/i,
    /sign in/i,
    /cookies?/i,
    /privacy policy/i,
    /terms of use/i,
    /advertisement/i,
    /enable javascript/i,
    /newsletter/i,
    /copy link/i,
    /share this article/i,
    /games by/i
  ];

  const sentences =
    raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => cleanPageChrome(s))
      .filter((s) => s.length >= 60)
      .filter((s) => s.length <= 420)
      .filter((s) => !noisePatterns.some((re) => re.test(s)));

  const useful =
    sentences.slice(0, 5).join(" ");

  return useful.length > 900
    ? useful.substring(0, 900)
    : useful;
}
async function fetchLiveWebRetrieval(query: string): Promise<UnifiedRetrievalSource[]> {
  try {
    if (!shouldUseLiveWeb(query)) {
      return [];
    }

    const base =
      process.env.BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://optinodeiq.com";

    const res = await fetch(`${base}/api/hx2/source-router`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query,
        limit: 5
      }),
      cache: "no-store"
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();

    const results =
      Array.isArray(json?.result?.search?.results)
        ? json.result.search.results
        : Array.isArray(json?.result?.result?.search?.results)
          ? json.result.result.search.results
          : [];

    const mapped = results.slice(0, 5).map((item: any) => ({
      title: String(item?.title || "Web result"),
      url: String(item?.url || item?.link || ""),
      source: String(item?.source || "web"),
      snippet: String(item?.snippet || item?.title || "")
    }));

    const enriched = await Promise.all(
      mapped.map(async (item: UnifiedRetrievalSource, index: number) => {
        if (index > 1 || !item.url) {
          return item;
        }

        const pageText =
          await fetchChosenPageText(item.url);

        const usefulText =
          distillPageText(pageText);

        return {
          ...item,
          snippet:
            usefulText && usefulText.length > String(item.snippet || "").length
              ? usefulText
              : item.snippet
        };
      })
    );

    return enriched;
  } catch {
    return [];
  }
}

async function fetchRssRetrieval(query: string): Promise<UnifiedRetrievalSource[]> {
  try {
    const items =
      await fetchRssFeeds(query);

    const relevanceTerms =
      normalizedRelevanceTerms(query);

    const mapped =
      items
        .filter((item: any) => {
          const haystack =
            [
              item?.title,
              item?.link,
              item?.source
            ]
              .map((value) => String(value || "").toLowerCase())
              .join(" ");

          return relevanceTerms.some((term) => haystack.includes(term));
        })
        .slice(0, 5)
        .map((item: any) => ({
          title: String(item?.title || "RSS result"),
          url: String(item?.link || ""),
          source: "rss",
          snippet: [
            String(item?.title || "").trim(),
            item?.published ? `Published: ${String(item.published).trim()}` : "",
            item?.source ? `Feed: ${String(item.source).trim()}` : ""
          ]
            .filter(Boolean)
            .join(" | ")
        }));

    const enriched =
      await Promise.all(
        mapped.map(async (item: UnifiedRetrievalSource, index: number) => {
          if (index > 1 || !item.url) {
            return item;
          }

          const pageText =
            await fetchChosenPageText(item.url);

          const usefulText =
            distillPageText(pageText);

          return {
            ...item,
            snippet:
              usefulText && usefulText.length > String(item.snippet || "").length
                ? usefulText
                : item.snippet
          };
        })
      );

    return enriched;
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
    rssResults,
    liveWebResults
  ] = await Promise.all([
    fetchWikipedia(normalized),
    fetchRssRetrieval(normalized),
    fetchLiveWebRetrieval(query)
  ]);

  const allSources = [
    ...wikiResults,
    ...rssResults,
    ...liveWebResults
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









