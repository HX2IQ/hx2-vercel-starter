import { NextRequest, NextResponse } from "next/server";
import { routeNode } from "../_lib/node-router";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const decision = routeNode({
      user_query: typeof body?.user_query === "string" ? body.user_query : ""
    });

    const executeUrl = `${req.nextUrl.origin}/api/hx2/execute`;

    const execRes = await fetch(executeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        node_id: decision.node_id,
        user_query: body.user_query || ""
      })
    });

    const execJson = await execRes.json();

    return NextResponse.json({
      ok: true,
      router_version: "v3_registry_driven",
      router: decision,
      execution: execJson
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Router error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

