import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";
import { retrieveContext } from "../_lib/unified-retrieval";
import { benchmarkQualityLiftAnswer } from "../_lib/master-benchmark-quality-lift";
import { masterChatDirectIntelligenceAnswer } from "../_lib/master-direct-intelligence";
import { synthesizeYouTubeChatAnswer } from "../_lib/master-youtube-chat-bridge";
import { executeNode } from "../_lib/master-node-executors";
import { executeX2 } from "../_lib/master-x2-markets-execution";

export const runtime = "nodejs";

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}


function cleanSourceEvidenceText(value: any): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceDomainFromUrl(url: any): string {
  try {
    const parsed = new URL(String(url || ""));
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}


function normalizedPublisherDomain(value: any): string {
  const surface =
    cleanSourceEvidenceText(value)
      .toLowerCase();

  const directDomain =
    surface.match(/\b([a-z0-9-]+\.(?:com|org|net|io|gov|edu|co))\b/i)?.[1] || "";

  if (directDomain) {
    return directDomain.replace(/^www\./i, "");
  }

  const known: Array<[RegExp, string]> = [
    [/\bdtcc\b/i, "dtcc.com"],
    [/\bstellar\b/i, "stellar.org"],
    [/\bripple\b/i, "ripple.com"],
    [/\bxrpl\b|\bxrp ledger\b/i, "xrpl.org"],
    [/\bcoindesk\b/i, "coindesk.com"],
    [/\bdecrypt\b/i, "decrypt.co"],
    [/\bthe block\b/i, "theblock.co"],
    [/\breuters\b/i, "reuters.com"],
    [/\bbloomberg\b/i, "bloomberg.com"],
    [/\bcnbc\b/i, "cnbc.com"],
    [/\bbitget\b/i, "bitget.com"],
    [/\btradingview\b/i, "tradingview.com"],
    [/\bwikipedia\b/i, "en.wikipedia.org"]
  ];

  for (const [pattern, domain] of known) {
    if (pattern.test(surface)) {
      return domain;
    }
  }

  return "";
}

function sourceEvidenceDomain(item: any, url: string, source: string, title: string): string {
  const urlDomain = sourceDomainFromUrl(url);
  const itemSurface = cleanSourceEvidenceText(item?.publisher || item?.provider || item?.source || item?.title || "");

  if (urlDomain && !/^news\.google\.com$/i.test(urlDomain)) {
    return urlDomain;
  }

  return (
    normalizedPublisherDomain(title) ||
    normalizedPublisherDomain(source) ||
    normalizedPublisherDomain(itemSurface) ||
    urlDomain ||
    source
  );
}
function buildSourceEvidenceContract(retrieval: any) {
  const rawSources =
    Array.isArray(retrieval?.sources)
      ? retrieval.sources
      : [];

  const sourceEvidence =
    rawSources
      .map((item: any) => {
        const title = cleanSourceEvidenceText(item?.title || item?.source || "Source");
        const source = cleanSourceEvidenceText(item?.source || "source");
        const url = cleanSourceEvidenceText(item?.url || "");
        const domain = sourceEvidenceDomain(item, url, source, title);
        const snippet = cleanSourceEvidenceText(item?.snippet || "").substring(0, 500);

        return {
          title,
          source,
          domain,
          url,
          snippet
        };
      })
      .filter((item: any) => item.title || item.source || item.url)
      .slice(0, 6);

  return {
    source_evidence: sourceEvidence,
    source_titles: Array.from(new Set(sourceEvidence.map((item: any) => item.title).filter(Boolean))),
    source_domains: Array.from(new Set(sourceEvidence.map((item: any) => item.domain).filter(Boolean))),
    source_urls: Array.from(new Set(sourceEvidence.map((item: any) => item.url).filter(Boolean))),
    source_count: rawSources.length
  };
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


  const masterChatDirectAnswer = masterChatDirectIntelligenceAnswer(benchmarkLiftInput);

  if (masterChatDirectAnswer) {
    return NextResponse.json({
      ok: true,
      answer: masterChatDirectAnswer,
      source: "master_chat_direct_intelligence",
      optimized_by: "HX2 Master Chat Direct Intelligence"
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

    const answerText = String(answer || "");

    const retrievalAnswerActive =
      /Latest retrieved read:|Supporting evidence:|Top sources checked:|Optimized by HX2 Retrieval Intelligence|Optimized by X2 Markets Intelligence/.test(answerText);

    const responseSource =
      retrievalAnswerActive ? "hx2_retrieval" : "hx2_chat_master";

    const responseOptimizedBy =
      retrievalAnswerActive
        ? (/X2 Markets Intelligence/.test(answerText) ? "X2 Markets Intelligence" : "HX2 Retrieval Intelligence")
        : "HX2 Master Orchestrator";

    const sourceEvidenceContract = buildSourceEvidenceContract(retrieval);

    return NextResponse.json({
      ok: true,
      input,
      routed: true,
      answer,
      source: responseSource,
      optimized_by: responseOptimizedBy,
      source_evidence: retrievalAnswerActive ? sourceEvidenceContract.source_evidence : [],
      source_titles: retrievalAnswerActive ? sourceEvidenceContract.source_titles : [],
      source_domains: retrievalAnswerActive ? sourceEvidenceContract.source_domains : [],
      source_urls: retrievalAnswerActive ? sourceEvidenceContract.source_urls : [],
      retrieval_summary: {
        retrieval_active: Boolean((retrieval as any)?.retrieval_active),
        retrieval_mode: String((retrieval as any)?.retrieval_mode || ""),
        source_count: sourceEvidenceContract.source_count,
        evidence_count: retrievalAnswerActive ? sourceEvidenceContract.source_evidence.length : 0
      },
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





