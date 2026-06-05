import { NextResponse } from "next/server";
import { buildKgxSpecializationLearning } from "../_lib/kgx-specialization-learning";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      "";

    if (!q) {
      return NextResponse.json(
        { ok: false, error: "Missing q or query" },
        { status: 400 }
      );
    }

    const specialization =
      await buildKgxSpecializationLearning(q);

    return NextResponse.json({
      ok: true,
      kgx_specialization_learning_active: true,
      specialization
    });
  }
  catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "specialization preview failed" },
      { status: 500 }
    );
  }
}
