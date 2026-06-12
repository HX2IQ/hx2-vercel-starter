import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function sse(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function extractChatText(value: any): string {
  const preferredKeys = [
    "answer",
    "reply",
    "message",
    "content",
    "text",
    "final",
    "final_answer",
    "response",
    "output"
  ];

  for (const key of preferredKeys) {
    const direct = value?.[key];
    if (typeof direct === "string" && direct.trim()) {
      return direct;
    }
  }

  for (const key of preferredKeys) {
    const nested = value?.data?.[key] || value?.result?.[key] || value?.details?.[key];
    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      if (item && typeof item === "object") {
        const found = extractChatText(item);
        if (found.trim()) return found;
      }
    }
  }

  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userQuery =
      typeof body?.user_query === "string" ? body.user_query :
      typeof body?.message === "string" ? body.message :
      typeof body?.content === "string" ? body.content :
      typeof body?.text === "string" ? body.text :
      "";

    if (!userQuery.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "user_query is required"
        },
        { status: 400 }
      );
    }

    const wantsStream =
      body?.stream === true ||
      req.headers.get("x-hx2-stream") === "1";

    const orchestratorRes = await fetch(`${req.nextUrl.origin}/api/hx2/chat-master`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_query: userQuery
      }),
      cache: "no-store"
    });

    const orchestratorJson = await orchestratorRes.json();
    const extractedAnswer = extractChatText(orchestratorJson);

    const answer =
      extractedAnswer ||
      "I received your message, but HX2 did not return a text response yet. The chat route is online; the upstream chat-master response needs inspection.";

    const router = orchestratorJson.router || orchestratorJson.route || null;
    const activeNode =
      router?.target_node ||
      router?.node ||
      orchestratorJson?.display_node?.node_id ||
      orchestratorJson?.display_node?.node_label ||
      "HX2";

    const rawConfidence =
      Number(router?.confidence ?? orchestratorJson?.confidence ?? 0.5);

    const confidence =
      rawConfidence <= 1
        ? Math.round(rawConfidence * 100)
        : Math.round(rawConfidence);

    const responseEnvelope = {
      active_node: activeNode,
      confidence,
      memory_used: Array.isArray(body?.conversation_context) && body.conversation_context.length > 0,
      related_nodes: Array.isArray(orchestratorJson?.related_nodes)
        ? orchestratorJson.related_nodes
        : [],
      suggested_actions: [
        "Continue conversation",
        "Inspect routing",
        "Open Owner Console"
      ],
      router
    };

    if (wantsStream) {
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              sse({
                type: "delta",
                delta: answer
              })
            )
          );

          controller.enqueue(
            encoder.encode(
              sse({
                type: "done",
                reply: answer,
                data: { ...orchestratorJson, envelope: responseEnvelope }
              })
            )
          );

          controller.close();
        }
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive"
        }
      });
    }

    return NextResponse.json({
      ok: orchestratorJson.ok === true,
      chat_version: "v1",
      answer,
      reply: answer,
      message: answer,
      content: answer,
      text: answer,
      router: orchestratorJson.router || null,
      envelope: responseEnvelope,
      active_node: responseEnvelope.active_node,
      confidence: responseEnvelope.confidence,
      memory_used: responseEnvelope.memory_used,
      suggested_actions: responseEnvelope.suggested_actions,
      details: orchestratorJson
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "HX2 chat error";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}




