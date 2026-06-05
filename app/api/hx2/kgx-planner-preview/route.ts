import { NextResponse } from "next/server";
import { buildKgxPlannerInfluence } from "../_lib/kgx-planner-influence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const q =
      url.searchParams.get("q") ||
      "";

    const influence =
      await buildKgxPlannerInfluence(q);

    return NextResponse.json({
      ok: true,
      kgx_planner_influence_active: true,
      influence
    });
  }
  catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err?.message ||
          "planner influence failed"
      },
      { status: 500 }
    );
  }
}
