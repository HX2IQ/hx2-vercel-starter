import { NextRequest, NextResponse } from "next/server";
import { runQa1Analysis } from "../../_lib/qa1";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = runQa1Analysis({
      user_query: typeof body?.user_query === "string" ? body.user_query : "",
    });

    return NextResponse.json({
      ok: true,
      node_id: "qa1",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown qa1 route error";

    return NextResponse.json(
      {
        ok: false,
        node_id: "qa1",
        error: message,
      },
      { status: 500 }
    );
  }
}

