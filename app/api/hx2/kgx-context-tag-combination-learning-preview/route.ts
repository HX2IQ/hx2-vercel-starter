import { NextResponse } from "next/server";
import { buildKgxContextTagCombinationLearning } from "../_lib/kgx-context-tag-combination-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const learning = await buildKgxContextTagCombinationLearning();

  return NextResponse.json({
    ok: true,
    kgx_context_tag_combination_learning_active: true,
    learning
  });
}
