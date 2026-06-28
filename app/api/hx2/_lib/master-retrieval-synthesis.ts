type NodeExecutionContext = {
  input: string;
  decision: any;
  execution: any;
  retrieval?: any;
};
export function getNodeRetrievalAnswer(
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

export function synthesizeRetrievedAnswer(ctx: any, nodeName = "HX2 Retrieval Intelligence"): string {
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
export function getRetrievedSummary(ctx: any): string {
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


