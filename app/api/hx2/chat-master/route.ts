import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

export const runtime = "nodejs";

type NodeExecutionContext = {
  input: string;
  decision: any;
  execution: any;
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

async function executeX2(ctx: NodeExecutionContext): Promise<string> {
  const q = ctx.input;
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

    const [adaptive, unifiedDecision, runtime] = await Promise.all([
      safeFetchJson(`${base}/api/hx2/kgx-adaptive-selection-preview?q=${encodeURIComponent(input)}`),
      safeFetchJson(`${base}/api/hx2/kgx-unified-decision-engine-preview?q=${encodeURIComponent(input)}`),
      safeFetchJson(`${base}/api/hx2/kgx-unified-runtime-intelligence-preview?q=${encodeURIComponent(input)}`)
    ]);

    const answer = await executeNode({
      input,
      decision,
      execution
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
