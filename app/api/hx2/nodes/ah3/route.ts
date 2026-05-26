import { NextRequest, NextResponse } from "next/server";
import { runAh3Analysis } from "../../_lib/ah3";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = runAh3Analysis({
      user_query: typeof body?.user_query === "string" ? body.user_query : "",
    });

    return NextResponse.json({
      ok: true,
      node_id: "ah3",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AH3 route error";

    return NextResponse.json(
      {
        ok: false,
        node_id: "ah3",
        error: message,
      },
      { status: 500 }
    );
  }
}
