import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

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

function nodeFooter(nodeName: string) {
  return `\n\n---\nOptimized by ${nodeName}`;
}

async function buildNodeAnswer(input: string, decision: any, execution: any): Promise<string> {
  const q = String(input || "").trim();
  const intent = String(decision?.intent || "general");
  const node = String(execution?.node || decision?.target_node || "hx2");

  if (!q) return "";

  if (intent === "markets" || node === "x2") {
    const symbol = detectCryptoSymbol(q);
    const wantsPrice = /price|current|now|today|trading|worth/i.test(q);
    const wantsForecast = /increase|go up|soon|forecast|prediction|outlook|expected/i.test(q);

    if (symbol && wantsPrice) {
      const spot = await getCryptoSpot(symbol);

      if (spot !== null) {
        const price = spot.toLocaleString("en-US", {
          minimumFractionDigits: spot < 1 ? 4 : 2,
          maximumFractionDigits: spot < 1 ? 6 : 2
        });

        if (wantsForecast) {
          return `${symbol} is currently about $${price} USD.\n\nFor whether it is expected to increase soon, I would treat that as uncertain without live news, volume, order-flow, and broader market confirmation. Short-term crypto moves can reverse quickly, so the safer X2 answer is: price is live, but the directional outlook needs the next layer of market/news retrieval before Opti should give a stronger probability-weighted call.${nodeFooter("X2 Markets Intelligence")}`;
        }

        return `${symbol} is currently about $${price} USD.${nodeFooter("X2 Markets Intelligence")}`;
      }

      return `I identified this as a ${symbol} market question, but the live price source did not return a usable result. The X2 live price hook is active, but this asset may need a secondary market data provider.${nodeFooter("X2 Markets Intelligence")}`;
    }

    return `X2 Markets Intelligence is active. Ask for a current price, market outlook, catalyst analysis, or probability-weighted crypto scenario and I will route it through the markets layer.${nodeFooter("X2 Markets Intelligence")}`;
  }

  if (intent === "parenting" || node === "pa2") {
    return `If your son is struggling with reading, I would focus on three things first:\n\n1. Find the bottleneck: decoding, fluency, vocabulary, or comprehension.\n2. Keep daily practice short and consistent: 15-20 minutes is better than long sessions that create resistance.\n3. Use high-interest material so reading feels useful, not like punishment.\n\nA strong starter plan is: phonics/decoding practice, repeated reading of short passages, one easy book for confidence, and one slightly harder book with support. Track progress weekly, not daily, so he does not feel judged every time he reads.${nodeFooter("PA2 Parenting Intelligence")}`;
  }

  if (intent === "developer" || node === "dev2") {
    return `DEV2 is active. Paste the terminal output, error, or git status and I will help you inspect the failure, identify the likely cause, and give the next safest PowerShell step.${nodeFooter("DEV2 Engineering Intelligence")}`;
  }

  if (intent === "health" || node === "ah2") {
    return `AH2 Health Intelligence is active. I can help prioritize symptoms, supplements, diet, sleep, and risk signals. For urgent, severe, or rapidly worsening symptoms, contact a medical professional or emergency care.${nodeFooter("AH2 Health Intelligence")}`;
  }

  if (intent === "legal" || node === "l2") {
    return `L2 Legal Intelligence is active. I can help review contracts, trademarks, business-risk language, and legal strategy, but this is not a substitute for a licensed attorney.${nodeFooter("L2 Legal Intelligence")}`;
  }

  return "";
}

function buildFallbackAnswer(input: string, decision: any, execution: any): string {
  const q = String(input || "").trim();

  if (!q) {
    return "I am online. Ask me anything and I will route it through HX2.";
  }

  if (/what\s+is\s+hx2/i.test(q)) {
    return "HX2 is your Optimized Intelligence operating system. It combines routing, memory, KGX learning, planning, forecasting, decision arbitration, runtime telemetry, and specialized nodes so Opti can reason through tasks instead of acting like a simple chatbot.";
  }

  return "I can help with that. Opti will use the best available HX2 intelligence layer for your question.";
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

    const decision = routeChatMasterIntent(input);
    const execution = CHAT_MASTER_EXECUTION_MAP[decision.intent];

    const base = req.nextUrl.origin;

    const adaptiveUrl =
      `${base}/api/hx2/kgx-adaptive-selection-preview?q=${encodeURIComponent(input)}`;

    const decisionUrl =
      `${base}/api/hx2/kgx-unified-decision-engine-preview?q=${encodeURIComponent(input)}`;

    const runtimeUrl =
      `${base}/api/hx2/kgx-unified-runtime-intelligence-preview?q=${encodeURIComponent(input)}`;

    const [adaptive, unifiedDecision, runtime] = await Promise.all([
      safeFetchJson(adaptiveUrl),
      safeFetchJson(decisionUrl),
      safeFetchJson(runtimeUrl)
    ]);

    const nodeAnswer = await buildNodeAnswer(input, decision, execution);
    const fallbackAnswer = buildFallbackAnswer(input, decision, execution);

    const answer =
      nodeAnswer ||
      fallbackAnswer ||
      "I am online. Ask me anything and I will route it through HX2.";

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
