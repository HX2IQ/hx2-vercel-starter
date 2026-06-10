import { NextResponse } from "next/server";
import { buildKgxCombinationFailureInfluence } from "../_lib/kgx-combination-failure-influence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const influence =
    await buildKgxCombinationFailureInfluence(q);

  return NextResponse.json({
    ok: true,
    kgx_combination_failure_influence_active: true,
    influence
  });
}
