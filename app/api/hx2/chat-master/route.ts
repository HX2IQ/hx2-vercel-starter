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


