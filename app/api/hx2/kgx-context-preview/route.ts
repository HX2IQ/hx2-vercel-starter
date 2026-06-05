import { NextResponse } from "next/server";
import { buildKgxGraphContext } from "../_lib/kgx-context-builder";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      "";

    if (!q) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing q or query"
        },
        { status: 400 }
      );
    }

    const graphContext = await buildKgxGraphContext(q);

    return NextResponse.json({
      ok: true,
      kgx_context_preview_active: true,
      graph_context: graphContext
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "KGX context preview failed"
      },
      { status: 500 }
    );
  }
}
