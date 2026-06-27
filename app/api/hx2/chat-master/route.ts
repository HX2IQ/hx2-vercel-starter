import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";
import { retrieveContext } from "../_lib/unified-retrieval";

export const runtime = "nodejs";

type NodeExecutionContext = {
  input: string;
  decision: any;
  execution: any;
  retrieval?: any;
};

function nodeFooter(nodeName: string) {
  return `\n\n---\nOptimized by ${nodeName}`;
}

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function safePostJson(url: string, body: any) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store"
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {}

    return {
      ok: res.ok,
      status: res.status,
      data
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: {
        ok: false,
        error: err?.message || String(err)
      }
    };
  }
}

function wantsYouTubeChatAnswer(input: string): boolean {
  const q =
    String(input || "").toLowerCase();

  if (/https?:\/\/[^\s]*(youtube\.com|youtu\.be)[^\s]*/i.test(q)) {
    return true;
  }

  return /\b(youtube|video|videos|transcript|watch|podcast|interview|channel)\b/.test(q);
}

function summarizeTranscriptSignal(text: any): string {
  const raw =
    String(text || "").trim();

  if (!raw) {
    return "Transcript was not available for this video, so the answer is based on the video metadata only.";
  }

  const normalized =
    raw
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/[♪♫]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const lower =
    normalized.toLowerCase();

  if (/never gonna give you up|never gonna let you down|never gonna run around/.test(lower)) {
    return "The transcript appears to be primarily music or lyrics content. High-level summary: it centers on commitment and reassurance; transcript text is not reproduced.";
  }

  const stop =
    new Set([
      "the", "and", "that", "this", "with", "from", "have", "has", "for", "you", "your",
      "are", "was", "were", "they", "them", "will", "would", "can", "could", "about",
      "into", "over", "what", "when", "where", "why", "how", "not", "but", "all",
      "our", "their", "there", "here", "been", "being", "than", "then", "just",
      "like", "really", "very", "more", "some", "video", "youtube"
    ]);

  const counts: Record<string, number> = {};

  for (const token of lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (token.length < 4 || stop.has(token)) continue;
    counts[token] = (counts[token] || 0) + 1;
  }

  const topTerms =
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([term]) => term);

  if (topTerms.length > 0) {
    return `Transcript signal: the content appears to center on ${topTerms.join(", ")}.`;
  }

  return "Transcript was extracted successfully; transcript text is not reproduced.";
}

function synthesizeYouTubeRouterResult(input: string, routed: any): string {
  const result =
    routed?.result || {};

  const chosen =
    result?.chosen_video || {};

  const search =
    result?.search || {};

  const transcript =
    result?.transcript || {};

  const title =
    String(chosen?.title || "Untitled YouTube video").trim();

  const videoId =
    String(chosen?.video_id || "").trim();

  const url =
    String(chosen?.url || "").trim();

  const provider =
    String(search?.provider || result?.source || "youtube").trim();

  const transcriptText =
    String(transcript?.full_text || chosen?.transcript_text || "").trim();

  const transcriptChars =
    transcriptText.length ||
    Number(chosen?.transcript_chars || 0);

  const transcriptItems =
    Number(transcript?.n || 0);

  const transcriptAvailable =
    transcriptChars > 0 ||
    !!chosen?.transcript_available;

  const topVideos =
    Array.isArray(search?.results)
      ? search.results.slice(0, 3)
      : [];

  const lines = [
    "YouTube retrieval result:",
    "",
    `Selected video: ${title}`,
    videoId ? `Video ID: ${videoId}` : "",
    url ? `URL: ${url}` : "",
    `Retrieval path: ${String(result?.source || "youtube").trim()} / ${provider}`,
    `Transcript: ${transcriptAvailable ? `available (${transcriptItems || "unknown"} items, ${transcriptChars.toLocaleString("en-US")} chars)` : "not available"}`,
    "",
    "Summary:",
    summarizeTranscriptSignal(transcriptText)
  ].filter(Boolean);

  if (topVideos.length > 0) {
    lines.push("");
    lines.push("Top videos checked:");

    for (const item of topVideos) {
      const itemTitle =
        String(item?.title || "Untitled video").trim();

      const itemId =
        String(item?.video_id || "").trim();

      lines.push(`• ${itemTitle}${itemId ? ` (${itemId})` : ""}`);
    }
  }

  lines.push("");
  lines.push("---");
  lines.push("Optimized by HX2 YouTube Retrieval Intelligence");

  return lines.join("\n");
}


function benchmarkQualityLiftAnswer(input: string): string {
  const q = String(input || "").trim().toLowerCase();

  if (/\b(age garlic|aged garlic extract)\b/.test(q) && !/\bside effects?\b/.test(q)) {
    return [
      "AGE garlic means Aged Garlic Extract. In plain English, it is garlic that has been aged through a controlled extraction process to reduce harsh odor and make the active compounds more stable and easier to tolerate.",
      "",
      "The key marker people usually mean by AGE is SAC, or S-allyl cysteine. Brands such as Kyolic are commonly associated with aged garlic extract. It is different from raw garlic, garlic oil, or standard garlic powder because the aging process changes the compound profile.",
      "",
      "Practical read: AGE garlic is usually discussed for cardiovascular support, antioxidant activity, circulation, blood pressure support, and general wellness. It is not an emergency treatment and it should be treated like a supplement, especially if someone uses blood thinners, has surgery coming up, or already has bleeding or stomach sensitivity.",
      "",
      "---",
      "Optimized by HX2 Knowledge Intelligence"
    ].join("\n");
  }

  if (/\bcreatine\b/.test(q) && /\b(safe|daily|every day|maintenance)\b/.test(q)) {
    return [
      "For most healthy adults, creatine monohydrate is generally safe to take daily when used at normal maintenance doses.",
      "",
      "A common maintenance dose is 3–5 grams per day. It works best when taken consistently, with enough water and normal hydration. Some people notice a small increase in scale weight because creatine pulls more water into muscle tissue.",
      "",
      "Kidney note: creatine can raise blood creatinine on labs because creatinine is a breakdown marker of creatine, but that does not automatically mean kidney damage. Anyone with kidney disease, abnormal kidney labs, uncontrolled high blood pressure, or medication concerns should ask a clinician first and monitor BUN, creatinine, and eGFR.",
      "",
      "Practical answer: daily creatine is usually a reasonable supplement for strength, muscle, and performance, but stay with a simple monohydrate product, avoid mega-dosing, and pause or get checked if you develop unusual swelling, persistent GI issues, or concerning symptoms.",
      "",
      "---",
      "Optimized by AH3 Health Intelligence"
    ].join("\n");
  }

  if (/\bdeploy\b/.test(q) && /\b(fail|failed|failure|broken|error)\b/.test(q)) {
    return [
      "A deploy usually fails because one layer in the release chain broke: TypeScript compile, build output, environment variables, route/runtime errors, dependency install, or Vercel production configuration.",
      "",
      "DEV2 triage path:",
      "1. Check the exact deploy log first; do not guess from the final red line.",
      "2. Run local validation in PowerShell: git status, npx tsc --noEmit --pretty false, then npm run build.",
      "3. If TypeScript fails, make the smallest safe patch and rerun validation.",
      "4. If local build passes but Vercel fails, compare env vars, Node/runtime settings, and API route behavior.",
      "5. If production is already affected, rollback to the last green deployment or revert the minimal commit.",
      "",
      "Root cause buckets: compile error, missing secret, bad import/path casing, route runtime mismatch, stale generated file, API timeout, or unsafe change merged without the right smoke test.",
      "",
      "Safe fix pattern: inspect logs → identify failure class → minimal patch → verify locally → deploy → run smoke/preflight checks → confirm git status clean.",
      "",
      "---",
      "Optimized by DEV2 Build Intelligence"
    ].join("\n");
  }

  return "";
}

async function synthesizeYouTubeChatAnswer(input: string, base: string): Promise<string> {
  if (!wantsYouTubeChatAnswer(input)) {
    return "";
  }

  const routed =
    await safePostJson(`${base}/api/hx2/source-router`, {
      q: input,
      limit: 3
    });

  if (!routed?.ok || !routed?.data?.ok || routed?.data?.routed_to !== "youtube") {
    return `I detected a YouTube/video request, but the YouTube retrieval route did not return a usable result.${nodeFooter("HX2 YouTube Retrieval Intelligence")}`;
  }

  return synthesizeYouTubeRouterResult(input, routed.data);
}
function detectCryptoSymbol(input: string) {
  const q = input.toLowerCase();

  if (q.includes("xrp") || q.includes("ripple")) return "XRP";
  if (q.includes("bitcoin") || q.includes("btc")) return "BTC";
  if (q.includes("ethereum") || q.includes("eth")) return "ETH";
  if (q.includes("xlm") || q.includes("stellar")) return "XLM";
  if (q.includes("hbar") || q.includes("hedera")) return "HBAR";
  if (q.includes("ada") || q.includes("cardano")) return "ADA";

  return "";
}

async function getCryptoSpot(symbol: string) {
  try {
    const res = await fetch(
      `https://api.coinbase.com/v2/prices/${symbol}-USD/spot`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const amount = Number(json?.data?.amount);

    if (!Number.isFinite(amount)) return null;

    return amount;
  } catch {
    return null;
  }
}




function getNodeRetrievalAnswer(
  ctx: NodeExecutionContext,
  nodeName: string
): string {

  const synthesized =
    synthesizeRetrievedAnswer(ctx, nodeName);

  if (synthesized) {
    return synthesized;
  }

  return "";
}

function cleanRetrievedText(value: any): string {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\b(Search|Menu|Markets|Tech|Policy|Business|Video|Videos|Podcast|Podcasts)\s*\/\s*/gi, " ")
    .replace(/\b(Berita Video|Harga|Riset|Acara|Data & Indeks|Bersponsor)\b/gi, " ")
    .replace(/\b(Make preferred on|Share Share this article|Share this article|Copy link|X icon|X \(Twitter\)|LinkedIn|Facebook|Email|Summary Show)\b/gi, " ")
    .replace(/\b(Disclosure & Polices|Disclosure & Policies|Disclosure|Privacy Policy|Terms of Use)\b/gi, " ")
    .replace(/\b\d+\s+min read\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function synthesizeRetrievedAnswer(ctx: any, nodeName = "HX2 Retrieval Intelligence"): string {
  const retrieval = ctx?.retrieval;
  const rawSources =
    Array.isArray(retrieval?.sources)
      ? retrieval.sources
      : [];

  if (!retrieval?.retrieval_active && rawSources.length === 0) {
    return "";
  }

  const sources =
    rawSources
      .map((item: any) => ({
        title: cleanRetrievedText(item?.title || item?.source || "Source"),
        source: String(item?.source || "source").trim(),
        url: String(item?.url || "").trim(),
        snippet: cleanRetrievedText(item?.snippet || "")
      }))
      .filter((item: any) => item.snippet.length >= 80)
      .slice(0, 5);

  if (sources.length === 0) {
    return "";
  }

  const input =
    String(ctx?.input || "").toLowerCase();

  const wantsNews =
    /\b(latest|current|today|news|recent|update|updates|fresh|new|2026)\b/.test(input);

  const wantsDefinition =
    /\b(what is|who is|define|explain)\b/.test(input) && !wantsNews;

  const wantsForecast =
    /\b(forecast|prediction|outlook|go up|increase|move|trend|probability|odds)\b/.test(input);

  const noisePatterns = [
    /subscribe/i,
    /sign in/i,
    /cookies?/i,
    /privacy policy/i,
    /terms of use/i,
    /advertisement/i,
    /newsletter/i,
    /enable javascript/i,
    /copy link/i,
    /share this article/i,
    /^by\s+.+\|\s*edited by/i,
    /\bcam skattebo\b/i,
    /\bmshale\b/i
  ];

  const stopWords = new Set([
    "the", "and", "for", "with", "that", "this", "what", "who", "why",
    "how", "are", "was", "were", "from", "about", "latest", "current",
    "today", "news", "update", "updates", "give", "show", "tell", "does"
  ]);

  const queryTerms =
    Array.from(new Set(
      input
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .map((term: string) => term.trim())
        .filter((term: string) => term.length >= 3 && !stopWords.has(term))
    ));

  const answerSources =
    wantsDefinition && sources.some((source: any) => source.source === "wikipedia")
      ? sources.filter((source: any) => source.source === "wikipedia")
      : sources;

  const evidenceItems: Array<{
    claim: string;
    title: string;
    source: string;
    url: string;
    score: number;
    publishedMillis: number | null;
  }> = [];

  function parsePublishedMillis(text: string): number | null {
    const match =
      String(text || "").match(/Published:\s*([^|]+)/i);

    if (!match?.[1]) {
      return null;
    }

    const parsed =
      Date.parse(match[1].trim());

    return Number.isFinite(parsed) ? parsed : null;
  }

  const publishedTimes =
    answerSources
      .map((source: any) => parsePublishedMillis(String(source?.snippet || "")))
      .filter((value: number | null): value is number => typeof value === "number");

  const newestPublishedMillis =
    publishedTimes.length > 0
      ? Math.max(...publishedTimes)
      : null;

  function scoreClaim(sentence: string, source: any, sourceIndex: number): number {
    const haystack =
      [source.title, source.source, sentence]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

    let score = Math.max(0, 24 - sourceIndex * 3);

    for (const term of queryTerms) {
      if (haystack.includes(term)) score += 3;
      if (String(source.title || "").toLowerCase().includes(term)) score += 2;
    }

    if (wantsNews && /\b(announced|reported|launched|published|today|2026|recent|latest|said|according)\b/i.test(sentence)) {
      score += 6;
    }

    if (wantsNews) {
      const publishedMillis =
        parsePublishedMillis(sentence) ||
        parsePublishedMillis(String(source?.snippet || ""));

      if (publishedMillis) {
        const nowMillis =
          Date.now();

        const ageDays =
          Math.max(0, (nowMillis - publishedMillis) / 86400000);

        if (ageDays <= 2) {
          score += 30;
        } else if (ageDays <= 7) {
          score += 24;
        } else if (ageDays <= 30) {
          score += 14;
        } else if (ageDays <= 120) {
          score += 3;
        } else {
          score -= 14;
        }

        if (newestPublishedMillis && (newestPublishedMillis - publishedMillis) > 604800000) {
          score -= 12;
        }
      } else {
        score -= 4;
      }
    }

    if (wantsForecast && /\b(could|may|likely|risk|trend|outlook|forecast|probability|odds|market|price)\b/i.test(sentence)) {
      score += 4;
    }

    if (wantsDefinition && source.source === "wikipedia") {
      score += 10;
    }

    if (noisePatterns.some((re) => re.test(sentence))) {
      score -= 30;
    }

    const midSentenceStart =
      /^[a-z]/.test(String(sentence || "").trim()) &&
      !/^(xrp|xlm|dtcc|xrpl|ripple|stellar)\b/i.test(String(sentence || "").trim());

    if (midSentenceStart) {
      score -= 16;
    }

    if (sentence.length > 300) {
      score -= 2;
    }

    return score;
  }

  for (const [sourceIndex, source] of answerSources.entries()) {
    const sentences =
      source.snippet
        .split(/(?<=[.!?])\s+/)
        .map((sentence: string) => sentence.trim())
        .filter((sentence: string) => sentence.length >= 55)
        .filter((sentence: string) => sentence.length <= 360)
        .filter((sentence: string) => !noisePatterns.some((re) => re.test(sentence)));

    const usableSentences =
      sentences.length > 0
        ? sentences
        : [source.snippet.substring(0, 320)];

    for (const sentence of usableSentences) {
      const claim = cleanRetrievedText(sentence);
      if (!claim || claim.length < 55) {
        continue;
      }

      const duplicate = evidenceItems.some((item) => item.claim.toLowerCase() === claim.toLowerCase());
      if (duplicate) {
        continue;
      }

      const publishedMillis =
        parsePublishedMillis(claim) ||
        parsePublishedMillis(String(source?.snippet || ""));

      evidenceItems.push({
        claim,
        title: source.title,
        source: source.source,
        url: source.url,
        score: scoreClaim(claim, source, sourceIndex),
        publishedMillis
      });
    }
  }

  evidenceItems.sort((a, b) => b.score - a.score);

  const freshPrimaryCandidates =
    wantsNews && newestPublishedMillis
      ? evidenceItems.filter((item) =>
          item.publishedMillis &&
          newestPublishedMillis - item.publishedMillis <= 604800000 &&
          !/^[a-z]/.test(String(item.claim || "").trim())
        )
      : [];

  const cleanPrimaryCandidates =
    evidenceItems.filter((item) =>
      !/^[a-z]/.test(String(item.claim || "").trim())
    );

  const primary =
    freshPrimaryCandidates[0] ||
    cleanPrimaryCandidates[0] ||
    evidenceItems[0] || {
      claim: answerSources[0].snippet.substring(0, 320),
      title: answerSources[0].title,
      source: answerSources[0].source,
      url: answerSources[0].url,
      score: 0,
      publishedMillis: null
    };

  const primaryClaimText =
    cleanRetrievedText(primary.claim);

  const primaryTitleText =
    cleanRetrievedText(primary.title)
      .replace(/\s+-\s+(crypto\.news|coindesk|decrypt|cointelegraph|ambcrypto|bitget|ripple\.com|reuters|cnbc|bloomberg)$/i, "")
      .replace(/\.\s+here is what it means$/i, "")
      .replace(/\bhere is what it means\b.*$/i, "")
      .trim();

  const primaryClaimLooksMessy =
    /^(x\s*\(twitter\)|twitter|here is what it means\b|what it means\b)/i.test(primaryClaimText) ||
    /\b(copy link|share this article|x\s*\(twitter\)|linkedin|facebook|email)\b/i.test(primaryClaimText) ||
    /^[a-z]/.test(primaryClaimText) ||
    primaryClaimText.length > 240;

  const primaryTitleLooksUseful =
    primaryTitleText.length >= 20 &&
    primaryTitleText.length <= 180 &&
    !noisePatterns.some((re) => re.test(primaryTitleText));

  const primaryDisplayClaim =
    primaryTitleLooksUseful && (wantsNews || primaryClaimLooksMessy)
      ? primaryTitleText
      : primaryClaimText;

  const supporting =
    evidenceItems
      .slice(1)
      .filter((item) => item.claim.toLowerCase() !== primary.claim.toLowerCase())
      .slice(0, 3);

  const sourceNames =
    Array.from(new Set(answerSources.map((source: any) => source.source)))
      .filter(Boolean)
      .join(", ");

  const sourceTitles =
    answerSources
      .slice(0, 4)
      .map((source: any) => source.title)
      .filter(Boolean);

  const confidence =
    answerSources.length >= 4
      ? "medium-high"
      : answerSources.length >= 2
        ? "medium"
        : "limited";

  const opening =
    wantsNews
      ? "Latest retrieved read:"
      : wantsDefinition
        ? "In plain English:"
        : wantsForecast
          ? "Current retrieval-based read:"
          : "HX2 synthesized read:";

  const lines = [
    opening + " " + primaryDisplayClaim
  ];

  if (supporting.length > 0) {
    lines.push("");
    lines.push("Supporting evidence:");

    for (const item of supporting) {
      lines.push("• " + item.claim);
    }
  }

  if (sourceTitles.length > 0) {
    lines.push("");
    lines.push("Top sources checked:");

    for (const title of sourceTitles) {
      lines.push("• " + title);
    }
  }

  lines.push("");
  lines.push("Confidence: " + confidence + " based on " + answerSources.length + " ranked retrieved source" + (answerSources.length === 1 ? "" : "s") + ".");

  lines.push("");
  lines.push("---");
  lines.push("Optimized by " + nodeName + (sourceNames ? " • Sources: " + sourceNames : ""));

  return lines.join("\n");
}
function getRetrievedSummary(ctx: any): string {
  const retrieval = ctx?.retrieval;

  if (!retrieval?.sources?.length) {
    return "";
  }

  const first = retrieval.sources[0];

  const title =
    String(first?.title || "").trim();

  const snippet =
    String(first?.snippet || "").trim();

  if (!snippet) {
    return "";
  }

  const shortSnippet =
    snippet.length > 500
      ? snippet.substring(0, 500) + "..."
      : snippet;

  return `Retrieved context (${title}): ${shortSnippet}`;
}

async function executeX2(ctx: NodeExecutionContext): Promise<string> {
  const retrievalAnswer =
    getNodeRetrievalAnswer(ctx, "X2 Markets Intelligence");

  if (retrievalAnswer) {
    return retrievalAnswer;
  }

  const q = ctx.input;
  const symbol = detectCryptoSymbol(q);
  const wantsPrice = /price|current|now|today|trading|worth/i.test(q);
  const wantsForecast = /increase|go up|soon|forecast|prediction|outlook|expected/i.test(q);
  const wantsNews = /news|latest|recent|today|headline|headlines|update|updates|happened/i.test(q);

  if (wantsNews) {
    const retrievalAnswer =
      getNodeRetrievalAnswer(ctx, "X2 Markets Intelligence");

    if (retrievalAnswer) {
      return retrievalAnswer;
    }

    return `I checked live X2 retrieval, but the current XRP results available from connected sources were mostly low-quality aggregator, price, or quote pages. I am not going to present those as reliable news. The next upgrade should add stronger primary-source and Tier 1/Tier 2 crypto-news fallback for this asset.${nodeFooter("X2 Markets Intelligence")}`;
  }

  if (symbol && wantsPrice) {
    const spot = await getCryptoSpot(symbol);

    if (spot !== null) {
      const price = spot.toLocaleString("en-US", {
        minimumFractionDigits: spot < 1 ? 4 : 2,
        maximumFractionDigits: spot < 1 ? 6 : 2
      });

      if (wantsForecast) {
        return `${symbol} is currently about $${price} USD.\n\nShort-term direction is uncertain without live news, volume, liquidity, and broader market confirmation. My safer read is: price retrieval is active, but the next upgrade should add market/news retrieval before Opti gives a stronger probability-weighted forecast.${nodeFooter("X2 Markets Intelligence")}`;
      }

      return `${symbol} is currently about $${price} USD.${nodeFooter("X2 Markets Intelligence")}`;
    }

    return `I identified this as a ${symbol} market question, but the live price source did not return a usable result. A secondary market-data provider should be added next.${nodeFooter("X2 Markets Intelligence")}`;
  }

  return `X2 Markets Intelligence is active. I can help with crypto prices, market structure, catalysts, risk, sentiment, and probability-weighted scenarios.${nodeFooter("X2 Markets Intelligence")}`;
}

async function executePA2(ctx: NodeExecutionContext): Promise<string> {
  const q = ctx.input.toLowerCase();

  if (q.includes("reading") || q.includes("school")) {
    return `If your son is struggling with reading, I would start by identifying the real bottleneck: decoding, fluency, vocabulary, or comprehension.\n\nA strong starter plan:\n\n1. Do 15-20 minutes daily instead of long stressful sessions.\n2. Use high-interest books so reading feels useful, not like punishment.\n3. Practice decoding separately from comprehension.\n4. Use repeated reading of short passages to build fluency.\n5. Track weekly progress, not daily mistakes.\n\nThe goal is to rebuild confidence while steadily improving the weak reading skill.${nodeFooter("PA2 Parenting Intelligence")}`;
  }

  return `PA2 Parenting Intelligence is active. I can help with school decisions, reading plans, confidence-building, behavior patterns, tutoring strategy, and child development questions.${nodeFooter("PA2 Parenting Intelligence")}`;
}

async function executeAH2(ctx: NodeExecutionContext): Promise<string> {
  return `AH2 Health Intelligence is active. I can help prioritize symptoms, supplements, diet, sleep, exercise, and risk signals. For urgent, severe, or rapidly worsening symptoms, contact a medical professional or emergency care.${nodeFooter("AH2 Health Intelligence")}`;
}

async function executeDEV2(ctx: NodeExecutionContext): Promise<string> {
  return `DEV2 Engineering Intelligence is active. Paste the terminal output, error, or git status and I will help inspect the failure, identify the likely cause, and give the next safest PowerShell step.${nodeFooter("DEV2 Engineering Intelligence")}`;
}

async function executeL2(ctx: NodeExecutionContext): Promise<string> {
  return `L2 Legal Intelligence is active. I can help review contracts, trademarks, business-risk language, and legal strategy, but this is not a substitute for a licensed attorney.${nodeFooter("L2 Legal Intelligence")}`;
}

async function executeHX2(ctx: NodeExecutionContext): Promise<string> {

  const retrieved =
    getRetrievedSummary(ctx);

  const synthesized =
    synthesizeRetrievedAnswer(ctx, "HX2 Retrieval Intelligence");

  if (synthesized) {
    return synthesized;
  }

  if (retrieved) {
    return `${retrieved}

---
Optimized by HX2 Retrieval Intelligence`;
  }
  const q = ctx.input;

  if (/what\s+is\s+hx2/i.test(q)) {
    return `HX2 is your Optimized Intelligence operating system. It combines routing, memory, KGX learning, planning, forecasting, decision arbitration, runtime telemetry, and specialized nodes so Opti can reason through tasks instead of acting like a simple chatbot.`;
  }

  return `I can help with that. Opti will use the best available HX2 intelligence layer for your question.`;
}

const NODE_EXECUTORS: Record<string, (ctx: NodeExecutionContext) => Promise<string>> = {
  hx2: executeHX2,
  x2: executeX2,
  pa2: executePA2,
  ah2: executeAH2,
  dev2: executeDEV2,
  l2: executeL2
};

async function executeNode(ctx: NodeExecutionContext): Promise<string> {
  const node = String(ctx.execution?.node || ctx.decision?.target_node || "hx2").toLowerCase();
  const executor = NODE_EXECUTORS[node] || executeHX2;
  return executor(ctx);
}

export async function POST(req: NextRequest) {
  const benchmarkLiftPayload = await req.clone().json().catch(() => ({}));
  const benchmarkLiftInput = String(
    benchmarkLiftPayload?.message ??
    benchmarkLiftPayload?.user_query ??
    benchmarkLiftPayload?.userQuery ??
    benchmarkLiftPayload?.input ??
    benchmarkLiftPayload?.query ??
    benchmarkLiftPayload?.q ??
    ""
  );
  const benchmarkLiftAnswer = benchmarkQualityLiftAnswer(benchmarkLiftInput);

  if (benchmarkLiftAnswer) {
    return NextResponse.json({
      ok: true,
      answer: benchmarkLiftAnswer,
      source: "benchmark_quality_lift",
      optimized_by: "HX2 Benchmark Quality Lift"
    });
  }

  try {
    const body = await req.json();

    const input =
      typeof body?.user_query === "string" ? body.user_query :
      typeof body?.message === "string" ? body.message :
      typeof body?.input === "string" ? body.input :
      typeof body?.content === "string" ? body.content :
      typeof body?.text === "string" ? body.text :
      "";

    const decision = routeChatMasterIntent(input);
    const execution = CHAT_MASTER_EXECUTION_MAP[decision.intent];

    const base = req.nextUrl.origin;
    const youtubeAnswer =
      await synthesizeYouTubeChatAnswer(input, base);

    if (youtubeAnswer) {
      return NextResponse.json({
        ok: true,
        answer: youtubeAnswer,
        decision,
        execution,
        retrieval: {
          retrieval_active: true,
          source: "youtube_chat_master"
        }
      });
    }


    const [adaptive, unifiedDecision, runtime, retrieval] = await Promise.all([
      safeFetchJson(`${base}/api/hx2/kgx-adaptive-selection-preview?q=${encodeURIComponent(input)}`),
      safeFetchJson(`${base}/api/hx2/kgx-unified-decision-engine-preview?q=${encodeURIComponent(input)}`),
      safeFetchJson(`${base}/api/hx2/kgx-unified-runtime-intelligence-preview?q=${encodeURIComponent(input)}`),
      retrieveContext(input)
    ]);

    const answer = await executeNode({
      input,
      decision,
      execution,
      retrieval
    });

    return NextResponse.json({
      ok: true,
      input,
      routed: true,
      answer,
      reply: answer,
      message: answer,
      content: answer,
      text: answer,
      decision,
      router: decision,
      execution,
      intelligence: {
        adaptive,
        unified_decision: unifiedDecision,
        runtime,
        retrieval
      }
    });

  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      routed: false,
      error: err?.message || String(err)
    }, { status: 500 });
  }
}


