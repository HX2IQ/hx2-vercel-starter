import { NextResponse } from "next/server";
import { buildKgxNodeEffectiveness }
  from "../_lib/kgx-node-effectiveness";

export const dynamic = "force-dynamic";

export async function GET() {

  try {

    const effectiveness =
      await buildKgxNodeEffectiveness();

    return NextResponse.json({
      ok: true,
      kgx_node_effectiveness_active: true,
      effectiveness
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        ok: false,
        error:
          err?.message ||
          "effectiveness failure"
      },
      { status: 500 }
    );
  }
}
