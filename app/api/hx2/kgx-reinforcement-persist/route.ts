import { NextResponse } from "next/server";
import { persistKgxReinforcementMemory } from "../_lib/kgx-reinforcement-persistence";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await persistKgxReinforcementMemory();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_memory_persistence_active: true,
      result
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement persistence failed"
      },
      { status: 500 }
    );
  }
}
