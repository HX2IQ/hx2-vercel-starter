import { NextResponse } from "next/server";
import { buildKgxReinforcementApplicationPreview } from "../_lib/kgx-reinforcement-application-preview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const preview =
      await buildKgxReinforcementApplicationPreview();

    return NextResponse.json({
      ok: true,
      kgx_reinforcement_application_preview_active: true,
      preview
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "reinforcement application preview failed"
      },
      { status: 500 }
    );
  }
}
