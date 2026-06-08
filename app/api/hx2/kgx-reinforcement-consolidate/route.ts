import { NextResponse } from "next/server";
import { consolidateKgxReinforcementState } from "../_lib/kgx-reinforcement-consolidation";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await consolidateKgxReinforcementState();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_consolidation_active: true,
      result
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement consolidation failed"
      },
      { status: 500 }
    );
  }
}
