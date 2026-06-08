import { NextResponse } from "next/server";
import { buildKgxContextTags } from "../_lib/kgx-context-tags";
import { buildKgxContextualRoutingBias } from "../_lib/kgx-contextual-routing-bias";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {

  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") || "";

  const context =
    buildKgxContextTags(q);

  const bias =
    await buildKgxContextualRoutingBias(
      context.tags
    );

  return NextResponse.json({
    ok: true,
    kgx_contextual_routing_bias_active: true,
    request: q,
    context,
    bias
  });
}
