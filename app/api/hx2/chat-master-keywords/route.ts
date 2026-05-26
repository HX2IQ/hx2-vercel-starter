import { NextResponse } from "next/server";
import { CHAT_MASTER_KEYWORDS } from "../contracts/chat-master-keywords";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    keywords: CHAT_MASTER_KEYWORDS,
    intents: Object.keys(CHAT_MASTER_KEYWORDS),
    count: Object.keys(CHAT_MASTER_KEYWORDS).length,
  });
}
