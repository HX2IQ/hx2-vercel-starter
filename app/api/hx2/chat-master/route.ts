import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

export const runtime = "nodejs";

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

function summarizeUnifiedDecision(data: any): string {
  const engine =
    data?.decision ||
    data?.engine ||
    data?.unified_decision_engine ||
    data;

  const decision =
    engine?.decision ||
    engine?.recommendation ||
    engine?.adjusted_recommendation ||
    engine?.arbitration_decision ||
    "review";

  const score =
    engine?.score ??
    engine?.unified_score ??
    engine?.unified_strategic_score ??
    engine?.adjusted_score ??
    null;

  const confidence =
    engine?.confidence ??
    engine?.confidence_score ??
    null;

  const parts = [
    `HX2 decision engine recommendation: ${decision}.`
  ];

  if (score !== null && score !== undefined) {
    parts.push(`Strategic score: ${score}.`);
  }

  if (confidence !== null && confidence !== undefined) {
    parts.push(`Confidence: ${confidence}.`);
  }

  return parts.join(" ");
}

function buildFallbackAnswer(input: string, decision: any, execution: any): string {
  const q = String(input || "").trim();
  const targetNode = execution?.node || decision?.target_node || "HX2";

  if (!q) {
    return "I’m online. Ask me anything and I’ll route it through HX2.";
  }

  if (/what\s+is\s+hx2/i.test(q)) {
    return "HX2 is your Optimized Intelligence operating system. It combines routing, memory, KGX learning, planning, forecasting, decision arbitration, runtime telemetry, and specialized nodes so Opti can reason through tasks instead of acting like a simple chatbot.";
  }

  return `I routed your request through ${targetNode}. ${execution?.description || "HX2 is ready to process this request."}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input =
      typeof body?.user_query === "string" ? body.user_query :
      typeof body?.message === "string" ? body.message :
      typeof body?.input === "string" ? body.input :
      typeof body?.content === "string" ? body.content :
      typeof body?.text === "string" ? body.text :
      "";

    const decision =
      routeChatMasterIntent(input);

    const execution =
      CHAT_MASTER_EXECUTION_MAP[
        decision.intent
      ];

    const base = req.nextUrl.origin;

    const adaptiveUrl =
      `${base}/api/hx2/kgx-adaptive-selection-preview?q=${encodeURIComponent(input)}`;

    const decisionUrl =
      `${base}/api/hx2/kgx-unified-decision-engine-preview?q=${encodeURIComponent(input)}`;

    const runtimeUrl =
      `${base}/api/hx2/kgx-unified-runtime-intelligence-preview?q=${encodeURIComponent(input)}`;

    const [
      adaptive,
      unifiedDecision,
      runtime
    ] = await Promise.all([
      safeFetchJson(adaptiveUrl),
      safeFetchJson(decisionUrl),
      safeFetchJson(runtimeUrl)
    ]);

    const decisionSummary =
      unifiedDecision?.ok === true
        ? summarizeUnifiedDecision(unifiedDecision)
        : "";

    const answer =
      decisionSummary ||
      buildFallbackAnswer(input, decision, execution);

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
        runtime
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
