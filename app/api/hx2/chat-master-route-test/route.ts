import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const input =
    req.nextUrl.searchParams.get("q") ||
    req.nextUrl.searchParams.get("input") ||
    "";

  const decision = routeChatMasterIntent(input);

  return NextResponse.json({
    ok: true,
    input,
    decision,
  });
}
