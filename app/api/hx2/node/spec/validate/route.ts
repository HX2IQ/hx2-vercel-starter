import { NextRequest, NextResponse } from "next/server";
import { validateNodeSpec } from "../../../_lib/node-spec";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = validateNodeSpec(body);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        missing: [],
        warnings: [],
        normalized_spec: null,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}

