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

  const terms: string[] = [];

  if (q.includes("xrp") || q.includes("ripple") || q.includes("xrpl")) {
    terms.push("xrp", "ripple", "xrpl");
  }

  if (q.includes("bitcoin") || /\bbtc\b/.test(q)) {
    terms.push("bitcoin", "btc");
  }

  if (q.includes("ethereum") || /\beth\b/.test(q)) {
    terms.push("ethereum", "eth");
  }

  if (q.includes("dtcc") || q.includes("depository trust")) {
    terms.push("dtcc", "depository", "clearing", "settlement", "tokenization", "tokenized", "securities");
  }

  if (q.includes("xlm") || q.includes("stellar")) {
    terms.push("xlm", "stellar", "stellar development foundation");
  }

  if (q.includes("hbar") || q.includes("hedera")) {
    terms.push("hbar", "hedera");
  }

  if (q.includes("cardano") || /\bada\b/.test(q)) {
    terms.push("cardano", "ada");
  }

  if (terms.length > 0) {
    return uniqueStrings(terms);
  }

  const genericStop = new Set([
    "latest", "current", "today", "news", "recent", "update", "updates",
    "fresh", "new", "give", "show", "tell", "what", "who", "why", "how"
  ]);

  return q
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !genericStop.has(term));
}

function relevanceEntityGroups(query: string): string[][] {
  const q =
    String(query || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const groups: string[][] = [];

  if (q.includes("xrp") || q.includes("ripple") || q.includes("xrpl")) {
    groups.push(["xrp", "ripple", "xrpl"]);
  }

  if (q.includes("xlm") || q.includes("stellar")) {
    groups.push(["xlm", "stellar", "stellar development foundation"]);
  }

  if (q.includes("dtcc") || q.includes("depository trust")) {
    groups.push(["dtcc", "depository trust", "clearing corporation", "tokenization", "tokenized", "digital token", "securities settlement"]);
  }

  if (q.includes("bitcoin") || /\bbtc\b/.test(q)) {
    groups.push(["bitcoin", "btc"]);
  }

  if (q.includes("ethereum") || /\beth\b/.test(q)) {
    groups.push(["ethereum", "eth"]);
  }

  if (q.includes("hbar") || q.includes("hedera")) {
    groups.push(["hbar", "hedera"]);
  }

  if (q.includes("cardano") || /\bada\b/.test(q)) {
    groups.push(["cardano", "ada"]);
  }

  return groups;
}

function relevanceGroupMatchCount(query: string, haystack: string): number {
  const groups =
    relevanceEntityGroups(query);

  if (groups.length === 0) {
    return normalizedRelevanceTerms(query).filter((term) => haystack.includes(term)).length;
  }

  return groups.filter((group) => group.some((term) => haystack.includes(term))).length;
}

function passesRetrievalRelevanceGate(
  query: string,
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

  const groups =
    relevanceEntityGroups(query);

  if (groups.length === 0) {
    return normalizedRelevanceTerms(query).some((term) => haystack.includes(term));
  }

  const matchedGroups =
    relevanceGroupMatchCount(query, haystack);

  if (groups.length >= 2) {
    const dtccTokenizationBridge =
      /\bdtcc\b/.test(haystack) &&
      /\b(tokenization|tokenized|digital token|securities|settlement|clearing|asset token)\b/.test(haystack);

    return matchedGroups >= 2 || dtccTokenizationBridge;
  }

  return matchedGroups >= 1;
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

function retrievalSourceTrustScore(
  query: string,
  item: UnifiedRetrievalSource,
  haystack: string
): number {
  const q =
    String(query || "").toLowerCase();

  const sourceSurface =
    [
      item.source,
      item.url,
      item.title,
      haystack
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

  const fresh =
    isFreshRetrievalQuery(query);

  const authoritative =
    /\b(dtcc\.com|stellar\.org|ripple\.com|xrpl\.org|sec\.gov|bitcoin\.org|ethereum\.org)\b/i.test(sourceSurface);

  const tierOne =
    /\b(reuters|bloomberg|cnbc|apnews|ap news|coindesk|the block|decrypt)\b/i.test(sourceSurface);

  const watchlist =
    /\b(cointribune|cryptorank|coinmarketcap|coingape|u\.today|watcher guru|the crypto basic|bitcoinist|ambcrypto)\b/i.test(sourceSurface);

  const genericAggregator =
    /\b(google news|rss|source-router|aggregator)\b/i.test(String(item.source || "").toLowerCase()) &&
    watchlist;

  let score = 0;

  if (authoritative) {
    score += fresh ? 24 : 12;
  }

  if (tierOne) {
    score += fresh ? 14 : 7;
  }

  if (/\b(dtcc|depository trust)\b/.test(q) && /\bdtcc\.com\b/i.test(sourceSurface)) {
    score += 16;
  }

  if (/\b(xrp|ripple|xrpl)\b/.test(q) && /\b(ripple\.com|xrpl\.org)\b/i.test(sourceSurface)) {
    score += 16;
  }

  if (/\b(xlm|stellar)\b/.test(q) && /\bstellar\.org\b/i.test(sourceSurface)) {
    score += 16;
  }

  if (watchlist) {
    score -= fresh ? 40 : 24;
  }

  if (genericAggregator) {
    score -= 10;
  }

  if (watchlist && !authoritative && !tierOne && fresh) {
    score -= 10;
  }

  return score;
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

  const matchedTermCount =
    terms.filter((term) => haystack.includes(term)).length;

  score += matchedTermCount * 5;

  const groupCount =
    relevanceEntityGroups(query).length;

  const matchedGroupCount =
    relevanceGroupMatchCount(query, haystack);

  if (groupCount >= 2) {
    score += matchedGroupCount * 10;

    if (!passesRetrievalRelevanceGate(query, item)) {
      score -= 35;
    }
  }

  if (item.source === "wikipedia" || item.source === "hx2_local_definition") {
    score += isDefinitionQuery(query) ? 50 : 8;
  }

  if (item.source === "rss" || /\b(coindesk|cointelegraph|google news|cnbc|reuters|bloomberg|decrypt|the block|ripple|xrpl)\b/i.test(item.source)) {
    score += isFreshRetrievalQuery(query) ? 8 : 2;
  }

  score += retrievalSourceTrustScore(query, item, haystack);

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

  return /\b(newsnow\.com|coinmarketcap\.com|coinbase\.com\/price|finance\.yahoo\.com\/quote|nasdaq\.com\/market-activity\/cryptocurrency|binance\.com\/en\/square|mshale|cam skattebo|price today|live price|marketcap|market cap|chart|token unlocks|claim community badge|loading data|affiliate links|submit token|all cex|all dex|spot perpetual futures|news headlines|crypto adoption is surging|goes all in on crypto)\b/.test(haystack);
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
function dedupeSourcesByUrlTitle(
  sources: UnifiedRetrievalSource[]
): UnifiedRetrievalSource[] {
  const seen = new Set<string>();
  const output: UnifiedRetrievalSource[] = [];

  for (const source of sources) {
    const urlKey =
      String(source.url || "")
        .toLowerCase()
        .split("?")[0]
        .replace(/\/$/, "");

    const titleKey =
      String(source.title || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const key = urlKey || titleKey;

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(source);
  }

  return output;
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

  const uniqueSources =
    dedupeSourcesByUrlTitle(cleanedSources);

  const scored =
    uniqueSources
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
function mergeEnrichedSnippetWithMetadata(
  originalSnippet: string,
  enrichedSnippet: string
): string {
  const original =
    String(originalSnippet || "").trim();

  const enriched =
    String(enrichedSnippet || "").trim();

  const publishedMatch =
    original.match(/Published:\s*([^|]+)/i);

  const published =
    publishedMatch?.[0]?.trim() || "";

  if (!enriched) {
    return original;
  }

  if (published && !/Published:/i.test(enriched)) {
    return `${enriched} | ${published}`;
  }

  return enriched;
}

async function enrichRetrievedSource(item: UnifiedRetrievalSource): Promise<UnifiedRetrievalSource> {
  if (!item.url || !shouldEnrichRetrievedSource(item)) {
    return item;
  }

  try {
    const pageText = await fetchChosenPageText(item.url);
    const usefulText = distillPageText(pageText);

    const originalSnippet =
      String(item.snippet || "");

    const nextSnippet =
      usefulText && usefulText.length > originalSnippet.length
        ? mergeEnrichedSnippetWithMetadata(originalSnippet, usefulText)
        : originalSnippet;

    return {
      ...item,
      snippet: nextSnippet
    };
  } catch {
    return item;
  }
}async function fetchLiveWebRetrieval(query: string): Promise<UnifiedRetrievalSource[]> {
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

function inferRssPublisher(item: any): string {
  const haystack =
    [
      item?.title,
      item?.link,
      item?.source
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

  if (haystack.includes("coindesk")) return "CoinDesk";
  if (haystack.includes("cointelegraph")) return "Cointelegraph";
  if (haystack.includes("cnbc")) return "CNBC";
  if (haystack.includes("reuters")) return "Reuters";
  if (haystack.includes("bloomberg")) return "Bloomberg";
  if (haystack.includes("decrypt")) return "Decrypt";
  if (haystack.includes("theblock") || haystack.includes("the block")) return "The Block";
  if (haystack.includes("ripple.com")) return "Ripple";
  if (haystack.includes("xrpl.org")) return "XRPL";
  if (haystack.includes("news.google.com")) return "Google News";

  const title =
    String(item?.title || "");

  const match =
    title.match(/\s-\s([A-Za-z0-9 .&]+)$/);

  return match?.[1]?.trim() || "RSS";
}
async function fetchRssRetrieval(query: string): Promise<UnifiedRetrievalSource[]> {
  try {
    const items =
      await fetchRssFeeds(query);

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

          const candidate = {
            title: String(item?.title || ""),
            url: String(item?.link || ""),
            source: String(item?.source || ""),
            snippet: ""
          };

          return passesRetrievalRelevanceGate(query, candidate) && !isLowQualityFreshSource(candidate);
        })
        .slice(0, 5)
        .map((item: any) => {
          const title =
            String(item?.title || "RSS result").trim();

          const published =
            item?.pubDate
              ? `Published: ${String(item.pubDate).trim()}`
              : "";

          return {
            title,
            url: String(item?.link || ""),
            source: inferRssPublisher(item),
            snippet: [
              title,
              published
            ]
              .filter(Boolean)
              .join(" | ")
          };
        });

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









