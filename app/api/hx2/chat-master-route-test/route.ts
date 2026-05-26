import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const input =
    req.nextUrl.searchParams.get("q") ||
    req.nextUrl.searchParams.get("input") ||
    "";

  const decision = routeChatMasterIntent(input);
  const execution = CHAT_MASTER_EXECUTION_MAP[decision.intent];

  return NextResponse.json({
    ok: true,
    input,
    decision,
    execution,
  });
}

