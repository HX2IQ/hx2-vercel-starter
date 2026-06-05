import { NextResponse } from "next/server";
import { buildKgxExecutionLearning }
  from "../_lib/kgx-execution-learning";

export const dynamic = "force-dynamic";

export async function GET() {

  try {

    const learning =
      await buildKgxExecutionLearning();

    return NextResponse.json({
      ok: true,
      kgx_execution_learning_active: true,
      learning
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        ok: false,
        error:
          err?.message ||
          "learning failure"
      },
      { status: 500 }
    );
  }
}
