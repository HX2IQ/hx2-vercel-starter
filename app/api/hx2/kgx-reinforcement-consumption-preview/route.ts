import { NextResponse } from "next/server";
import { buildKgxReinforcementConsumption } from "../_lib/kgx-reinforcement-consumption";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const consumption =
      await buildKgxReinforcementConsumption();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_consumption_preview_active: true,
      consumption
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement consumption preview failed"
      },
      { status: 500 }
    );
  }
}
