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
        { ok: false, error: "Missing q or query" },
        { status: 400 }
      );
    }

    const routing = await buildKgxAdaptiveNodeSelection(q);

    return NextResponse.json({
      ok: true,
      kgx_self_optimizing_routing_active: true,
      routing
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "routing preview failed"
      },
      { status: 500 }
    );
  }
}
