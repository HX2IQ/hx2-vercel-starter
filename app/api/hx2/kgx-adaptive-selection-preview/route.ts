import { NextResponse } from "next/server";
import { buildKgxAdaptiveNodeSelection } from "../_lib/kgx-adaptive-node-selection";

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

    const adaptiveSelection =
      await buildKgxAdaptiveNodeSelection(q);

    return NextResponse.json({
      ok: true,
      kgx_adaptive_selection_active: true,
      adaptive_selection: adaptiveSelection
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "adaptive selection failed"
      },
      { status: 500 }
    );
  }
}
