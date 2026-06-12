import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

export const runtime = "nodejs";

function buildChatMasterAnswer(input: string, decision: any, execution: any): string {
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

    const answer =
      buildChatMasterAnswer(input, decision, execution);

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
      execution
    });

  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      routed: false,
      error: err?.message || String(err)
    }, { status: 500 });
  }
}
