import { NextRequest, NextResponse } from "next/server";
import { routeNode } from "../_lib/node-router";
import { formatHx2Response } from "../_lib/response-formatter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.user_query === "string" ? body.user_query : "";

    // 1. Route
    const decision = routeNode({ user_query: query });

    const base = req.nextUrl.origin;

    // 2. Execute selected node
    const execRes = await fetch(`${base}/api/hx2/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        node_id: decision.node_id,
        user_query: query
      })
    });

    const execJson = await execRes.json();

    // 3. Run QA1 on the result (optional safety layer)
    let qaJson: any = null;

    try {
      const qaRes = await fetch(`${base}/api/hx2/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          node_id: "qa1",
          user_query: query
        })
      });

      qaJson = await qaRes.json();
    } catch {
      qaJson = { ok: false, error: "QA1 execution failed" };
    }

    // 4. Return structured orchestrated result
    const formatted = formatHx2Response({
      router: decision,
      primary: execJson,
      qa: qaJson
    });

    return NextResponse.json({
      ok: true,
      orchestrator_version: "v1",
      response_format_version: formatted.format_version,
      answer: formatted.answer,
      router: decision,
      primary: execJson,
      qa: qaJson
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Orchestrator error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

