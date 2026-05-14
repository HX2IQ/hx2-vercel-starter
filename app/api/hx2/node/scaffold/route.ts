import { NextRequest, NextResponse } from "next/server";
import { validateNodeSpec } from "../../_lib/node-spec";
import { buildNodeScaffold } from "../../_lib/node-scaffold";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = validateNodeSpec(body);

    if (!validation.valid || !validation.normalized_spec) {
      return NextResponse.json({
        ok: false,
        valid: false,
        validation,
        scaffold: null,
      });
    }

    const scaffold = buildNodeScaffold(validation.normalized_spec);

    return NextResponse.json({
      ok: true,
      valid: true,
      validation,
      scaffold,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        validation: null,
        scaffold: null,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}

