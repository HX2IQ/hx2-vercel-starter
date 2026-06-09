import { NextResponse } from "next/server";
import { buildKgxAssemblyEffectiveness } from "../_lib/kgx-assembly-effectiveness";

export const dynamic = "force-dynamic";

export async function GET() {
  const effectiveness = await buildKgxAssemblyEffectiveness();

  return NextResponse.json({
    ok: true,
    kgx_assembly_effectiveness_active: true,
    effectiveness
  });
}
