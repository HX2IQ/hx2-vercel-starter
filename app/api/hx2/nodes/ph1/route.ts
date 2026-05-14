import { NextRequest, NextResponse } from "next/server";
import { runPh1Analysis } from "../../_lib/ph1";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = runPh1Analysis({
      user_query: typeof body?.user_query === "string" ? body.user_query : "",
    });

    return NextResponse.json({
      ok: true,
      node_id: "ph1",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown PH1 route error";

    return NextResponse.json(
      {
        ok: false,
        node_id: "ph1",
        error: message,
      },
      { status: 500 }
    );
  }
}
