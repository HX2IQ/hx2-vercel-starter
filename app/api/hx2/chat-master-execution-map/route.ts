import { NextResponse } from "next/server";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    execution_map: CHAT_MASTER_EXECUTION_MAP,
    intents: Object.keys(CHAT_MASTER_EXECUTION_MAP),
    count: Object.keys(CHAT_MASTER_EXECUTION_MAP).length,
  });
}
