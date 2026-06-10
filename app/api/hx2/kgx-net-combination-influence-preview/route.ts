import { NextResponse } from "next/server";
import { buildKgxNetCombinationInfluence } from "../_lib/kgx-net-combination-influence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const influence =
    await buildKgxNetCombinationInfluence(q);

  return NextResponse.json({
    ok: true,
    kgx_net_combination_influence_active: true,
    influence
  });
}
