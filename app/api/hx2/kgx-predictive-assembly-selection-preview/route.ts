import { NextResponse } from "next/server";
import { buildKgxPredictiveAssemblySelection } from "../_lib/kgx-predictive-assembly-selection";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    "";

  const selection =
    await buildKgxPredictiveAssemblySelection(q);

  return NextResponse.json({
    ok: true,
    kgx_predictive_assembly_selection_active: true,
    selection
  });
}
