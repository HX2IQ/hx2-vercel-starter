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


function buildNodeAnswer(input: string, decision: any, execution: any): string {
  const q = String(input || "").trim();
  const intent = String(decision?.intent || "general");
  const node = String(execution?.node || decision?.target_node || "hx2");

  if (!q) {
    return "";
  }

  if (intent === "markets" || node === "x2") {
    if (/current|price|now|today|live/i.test(q) && /xrp|crypto|bitcoin|btc|xlm|hbar|ada/i.test(q)) {
      return "I routed this to X2 markets intelligence, but I do not yet have live market-price retrieval wired into this chat route. The next step is to connect X2 to a live price source so Opti can return the current XRP price instead of only identifying the correct node.";
    }

    return "X2 markets intelligence is active. I can analyze crypto, market structure, sentiment, catalysts, risk, and scenarios, but live price retrieval still needs to be wired into the chat execution layer.";
  }

  if (intent === "developer" || node === "dev2") {
    return "DEV2 is active. I can help inspect build errors, TypeScript failures, route issues, git status, deployment problems, and sprint planning. Paste the terminal output or say `Sprint next` and I’ll guide the next safe step.";
  }

  if (intent === "parenting" || node === "pa2") {
    return "PA2 parenting intelligence is active. I can help with reading plans, school decisions, tutoring strategy, confidence-building language, behavior patterns, and child development questions.";
  }

  if (intent === "health" || node === "ah2") {
    return "AH2 health intelligence is active. I can help think through supplements, symptoms, diet, sleep, exercise, and risk signals. For urgent or serious symptoms, you should contact a medical professional.";
  }

  if (intent === "legal" || node === "l2") {
    return "L2 legal intelligence is active. I can help review contracts, trademarks, business-risk language, and legal strategy, but I am not a substitute for a licensed attorney.";
  }

  return "";
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

    const nodeAnswer =
      buildNodeAnswer(input, decision, execution);

    const fallbackAnswer =
      buildFallbackAnswer(input, decision, execution);

    const decisionSummary =
      unifiedDecision?.ok === true
        ? summarizeUnifiedDecision(unifiedDecision)
        : "";

    const answer =
      nodeAnswer ||
      fallbackAnswer ||
      decisionSummary ||
      "I’m online. Ask me anything and I’ll route it through HX2.";

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



