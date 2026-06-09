import { NextResponse } from "next/server";
import { buildKgxAssemblyLearning } from "../_lib/kgx-assembly-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const learning = await buildKgxAssemblyLearning();

  return NextResponse.json({
    ok: true,
    kgx_assembly_learning_active: true,
    learning
  });
}
