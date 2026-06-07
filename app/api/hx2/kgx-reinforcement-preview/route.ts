import { NextResponse } from "next/server";
import { buildKgxReinforcementPreview } from "../_lib/kgx-reinforcement-preview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const preview = await buildKgxReinforcementPreview();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_preview_active: true,
      preview
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement preview failed"
      },
      { status: 500 }
    );
  }
}
