import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function sse(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
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
    const answer = orchestratorJson.answer || "";

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
                data: orchestratorJson
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

