import { NextResponse } from "next/server";
import { buildKgxCombinationSynergyLearning } from "../_lib/kgx-combination-synergy-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const learning =
    await buildKgxCombinationSynergyLearning();

  return NextResponse.json({
    ok: true,
    kgx_combination_synergy_learning_active: true,
    learning
  });
}
