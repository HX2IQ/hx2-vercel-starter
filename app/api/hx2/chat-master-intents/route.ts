import { NextResponse } from "next/server";
import { CHAT_MASTER_INTENTS } from "../contracts/chat-master";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    chat_master_intents: {
      count: CHAT_MASTER_INTENTS.length,
      intents: CHAT_MASTER_INTENTS,
      status: CHAT_MASTER_INTENTS.length > 0 ? "available" : "missing",
    },
  });
}
