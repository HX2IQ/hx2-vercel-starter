import { NextResponse } from "next/server";
import { buildKgxCombinationSynergyInfluence } from "../_lib/kgx-combination-synergy-influence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const influence =
    await buildKgxCombinationSynergyInfluence(q);

  return NextResponse.json({
    ok: true,
    kgx_combination_synergy_influence_active: true,
    influence
  });
}
