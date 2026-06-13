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


function isDefinitionQuery(query: string): boolean {
  const q = String(query || "").toLowerCase();

  return /\b(what is|who is|define|explain)\b/.test(q) &&
    !/\b(latest|current|today|news|recent|update|updates|market update|price|forecast|prediction)\b/.test(q);
}

function isFreshRetrievalQuery(query: string): boolean {
  const q = String(query || "").toLowerCase();

  return /\b(latest|current|today|news|recent|update|updates|market update|fresh|new|2026)\b/.test(q);
}

function normalizedRelevanceTerms(query: string): string[] {
  const q =
    String(query || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  if (q.includes("xrp") || q.includes("ripple") || q.includes("xrpl")) {
    return ["xrp", "ripple", "xrpl"];
  }

  if (q.includes("bitcoin") || /\bbtc\b/.test(q)) {
    return ["bitcoin", "btc"];
  }

  if (q.includes("ethereum") || /\beth\b/.test(q)) {
    return ["ethereum", "eth"];
  }

  if (q.includes("dtcc") || q.includes("depository trust")) {
    return ["dtcc", "depository", "clearing"];
  }

  if (q.includes("xlm") || q.includes("stellar")) {
    return ["xlm", "stellar"];
  }

  if (q.includes("hbar") || q.includes("hedera")) {
    return ["hbar", "hedera"];
  }

  if (q.includes("cardano") || /\bada\b/.test(q)) {
    return ["cardano", "ada"];
  }

  return q
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3);
}

function localDefinitionFallback(normalized: string): UnifiedRetrievalSource[] {
  const key =
    String(normalized || "")
      .toLowerCase()
      .trim();

  const definitions: Record<string, UnifiedRetrievalSource> = {
    "xrp ledger": {
      title: "XRP Ledger",
      url: "https://xrpl.org/",
      source: "hx2_local_definition",
      snippet: "The XRP Ledger is a public blockchain designed for fast settlement, low transaction costs, token issuance, and cross-border value movement. XRP is the native asset used on the ledger."
    },
    "depository trust & clearing corporation": {
      title: "Depository Trust & Clearing Corporation",
      url: "https://www.dtcc.com/",
      source: "hx2_local_definition",
      snippet: "The Depository Trust & Clearing Corporation, or DTCC, is a major financial market infrastructure company that provides clearing, settlement, custody, and trade reporting services for financial markets."
    },
    "bitcoin": {
      title: "Bitcoin",
      url: "https://bitcoin.org/",
      source: "hx2_local_definition",
      snippet: "Bitcoin is a decentralized digital asset and payment network that uses proof-of-work mining and a public blockchain to transfer value without a central issuer."
    },
    "ethereum": {
      title: "Ethereum",
      url: "https://ethereum.org/",
      source: "hx2_local_definition",
      snippet: "Ethereum is a decentralized blockchain network that supports smart contracts, decentralized applications, tokens, and programmable settlement through its native asset ETH."
    }
  };

  const direct =
    definitions[key];

  return direct ? [direct] : [];
}

function retrievalSourceScore(
  query: string,
  item: UnifiedRetrievalSource
): number {
  const q =
    String(query || "").toLowerCase();

  const haystack =
    [
      item.title,
      item.url,
      item.source,
      item.snippet
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

  const terms =
    normalizedRelevanceTerms(query);

  let score = 0;

  for (const term of terms) {
    if (haystack.includes(term)) {
      score += 5;
    }
  }

  if (item.source === "wikipedia" || item.source === "hx2_local_definition") {
    score += isDefinitionQuery(query) ? 50 : 8;
  }

  if (item.source === "rss") {
    score += isFreshRetrievalQuery(query) ? 8 : 2;
  }

  if (/\b(coindesk|cointelegraph|reuters|cnbc|bloomberg|the block|decrypt|ripple\.com|dtcc\.com|xrpl\.org|bitcoin\.org|ethereum\.org)\b/.test(haystack)) {
    score += 14;
  }

  if (isFreshRetrievalQuery(query) && /\b(newsnow\.com|coinmarketcap\.com|coinbase\.com\/price|finance\.yahoo\.com\/quote|nasdaq\.com\/market-activity\/cryptocurrency|price today|live price|marketcap|market cap|chart|token unlocks|claim community badge|loading data|affiliate links|submit token|all cex|all dex|spot perpetual futures)\b/.test(haystack)) {
    score -= 30;
  }

  if (/\b(copy link|share this article|privacy policy|terms of use|subscribe|sign in|advertisement|sponsored)\b/.test(haystack)) {
    score -= 12;
  }

  if (q.includes("news") && /\b(news|latest|update|reported|said|announced|launched|urged|partnership|settlement)\b/.test(haystack)) {
    score += 8;
  }

  return score;
}

function isLowQualityFreshSource(
  item: UnifiedRetrievalSource
): boolean {
  const haystack =
    [
      item.title,
      item.url,
      item.source,
      item.snippet
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

  return /\b(newsnow\.com|coinmarketcap\.com|coinbase\.com\/price|finance\.yahoo\.com\/quote|nasdaq\.com\/market-activity\/cryptocurrency|binance\.com\/en\/square|price today|live price|marketcap|market cap|chart|token unlocks|claim community badge|loading data|affiliate links|submit token|all cex|all dex|spot perpetual futures|news headlines)\b/.test(haystack);
}

function stripAnswerJunkFromSnippet(
  item: UnifiedRetrievalSource
): UnifiedRetrievalSource {
  const cleanedSnippet =
    String(item.snippet || "")
      .replace(/\bNews Video Prices Research Events Data & Indices Sponsored\b/gi, " ")
      .replace(/\bNews Video Prices Research Events Data &amp; Indices Sponsored\b/gi, " ")
      .replace(/\bSponsored en Finance\b/gi, " ")
      .replace(/\ben Finance\b/gi, " ")
      .replace(/\bCopy link\b/gi, " ")
      .replace(/\bShare this article\b/gi, " ")
      .replace(/\bSkip to main content\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  return {
    ...item,
    snippet: cleanedSnippet
  };
}
function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function expandedFreshQueries(query: string): string[] {
  const q =
    String(query || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  if (!isFreshRetrievalQuery(query)) {
    return [query];
  }

  if (q.includes("xrp") || q.includes("ripple") || q.includes("xrpl")) {
    return uniqueStrings([
      query,
      "latest XRP Ripple news",
      "XRP Ripple XRPL news CoinDesk",
      "XRP Ripple XRPL news Cointelegraph",
      "XRP Ripple XRPL news The Block",
      "XRP Ripple XRPL news Decrypt",
      "XRP Ripple XRPL news CNBC",
      "Ripple XRP XRPL official announcement",
      "site:ripple.com XRP XRPL news",
      "site:xrpl.org XRP Ledger news"
    ]);
  }

  if (q.includes("bitcoin") || /\bbtc\b/.test(q)) {
    return uniqueStrings([
      query,
      "latest Bitcoin BTC market news CoinDesk",
      "latest Bitcoin BTC market news Cointelegraph",
      "latest Bitcoin BTC market news CNBC",
      "latest Bitcoin BTC market news Reuters",
      "latest Bitcoin BTC market news Bloomberg",
      "latest Bitcoin BTC market news The Block",
      "latest Bitcoin BTC market news Decrypt"
    ]);
  }

  if (q.includes("dtcc")) {
    return uniqueStrings([
      query,
      "latest DTCC news",
      "site:dtcc.com news",
      "DTCC blockchain tokenization news",
      "DTCC digital assets news"
    ]);
  }

  return [query];
}
function rankSourcesForQuery(
  query: string,
  sources: UnifiedRetrievalSource[]
): UnifiedRetrievalSource[] {
  const fresh =
    isFreshRetrievalQuery(query);

  const cleanedSources =
    sources
      .map((source) => stripAnswerJunkFromSnippet(source))
      .filter((source) => {
        if (!fresh) {
          return true;
        }

        return !isLowQualityFreshSource(source);
      });

  const scored =
    cleanedSources
      .map((source) => ({
        source,
        score: retrievalSourceScore(query, source)
      }))
      .sort((a, b) => b.score - a.score);

  const hasGoodSource =
    scored.some((item) => item.score >= 8);

  return scored
    .filter((item) => !hasGoodSource || item.score >= -5)
    .map((item) => item.source);
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

function shouldEnrichRetrievedSource(
  item: UnifiedRetrievalSource
): boolean {
  const haystack =
    [
      item.title,
      item.url,
      item.source,
      item.snippet
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

  if (!item.url) {
    return false;
  }

  if (/\b(newsnow\.com|coinmarketcap\.com|coinbase\.com\/price|finance\.yahoo\.com\/quote|nasdaq\.com\/market-activity\/cryptocurrency|binance\.com\/en\/square)\b/.test(haystack)) {
    return false;
  }

  if (/\b(price today|live price|marketcap|market cap|chart|news headlines|latest news|loading data|token unlocks|claim community badge|all cex|all dex|spot perpetual futures)\b/.test(haystack)) {
    return false;
  }

  if (/\b(coindesk\.com|cointelegraph\.com|reuters\.com|cnbc\.com|bloomberg\.com|decrypt\.co|theblock\.co|ripple\.com|dtcc\.com|xrpl\.org)\b/.test(haystack)) {
    return true;
  }

  return true;
}
async function enrichRetrievedSource(
  item: UnifiedRetrievalSource
): Promise<UnifiedRetrievalSource> {
  if (!item.url || !shouldEnrichRetrievedSource(item)) {
    return item;
  }

  try {
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
  } catch {
    return item;
  }
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
        return await enrichRetrievedSource(item);
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
        return await enrichRetrievedSource(item);
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

  const definitionOnly =
    isDefinitionQuery(query);

  const freshQueries =
    expandedFreshQueries(query);

  const [
    wikiResults,
    rssResultGroups,
    liveWebResultGroups
  ] = await Promise.all([
    fetchWikipedia(normalized),
    definitionOnly
      ? Promise.resolve([] as UnifiedRetrievalSource[][])
      : Promise.all(freshQueries.map((freshQuery) => fetchRssRetrieval(freshQuery))),
    definitionOnly
      ? Promise.resolve([] as UnifiedRetrievalSource[][])
      : Promise.all(freshQueries.map((freshQuery) => fetchLiveWebRetrieval(freshQuery)))
  ]);

  const rssResults =
    rssResultGroups.flat();

  const liveWebResults =
    liveWebResultGroups.flat();

  const authoritativeDefinitions =
    wikiResults.length > 0
      ? wikiResults
      : definitionOnly
        ? localDefinitionFallback(normalized)
        : [];

  const allSources =
    rankSourcesForQuery(query, [
      ...authoritativeDefinitions,
      ...rssResults,
      ...liveWebResults
    ]);

  return {
    query,
    normalized_query: normalized,
    web_results: allSources,
    memory_results: [],
    sources: allSources,
    retrieval_active: allSources.length > 0,
    retrieval_mode: "live"
  };
}
