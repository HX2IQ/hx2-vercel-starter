import { NextResponse } from "next/server";
import { buildKgxContextualAssemblyLearning } from "../_lib/kgx-contextual-assembly-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const learning = await buildKgxContextualAssemblyLearning();

  return NextResponse.json({
    ok: true,
    kgx_contextual_assembly_learning_active: true,
    learning
  });
}
