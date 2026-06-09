import { NextResponse } from "next/server";
import { buildKgxAssemblyRecommendation } from "../_lib/kgx-assembly-recommendation";

export const dynamic = "force-dynamic";

export async function GET() {
  const recommendation = await buildKgxAssemblyRecommendation();

  return NextResponse.json({
    ok: true,
    kgx_assembly_recommendation_active: true,
    recommendation
  });
}
