import { NextResponse } from "next/server";
import { buildKgxReinforcementHealth } from "../_lib/kgx-reinforcement-health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await buildKgxReinforcementHealth();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_health_active: true,
      health
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement health failed"
      },
      { status: 500 }
    );
  }
}
