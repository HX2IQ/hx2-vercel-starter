import { NextRequest, NextResponse } from "next/server";
import { routeChatMasterIntent } from "../_lib/chat-master-router";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const input =
      body?.message ||
      body?.input ||
      "";

    const decision =
      routeChatMasterIntent(input);

    return NextResponse.json({
      ok: true,
      input,
      routed: true,
      decision
    });

  } catch (err: any) {

    return NextResponse.json({
      ok: false,
      routed: false,
      error: err?.message || String(err)
    }, { status: 500 });

  }
}
