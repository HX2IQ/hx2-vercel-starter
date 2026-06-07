import { NextResponse } from "next/server";
import { recallLatestKgxReinforcementMemory } from "../_lib/kgx-reinforcement-recall";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recall =
      await recallLatestKgxReinforcementMemory();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_recall_active: true,
      recall
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement recall failed"
      },
      { status: 500 }
    );
  }
}
