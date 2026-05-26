import { NextRequest, NextResponse } from "next/server";
import { validateNodeSpec } from "../../../_lib/node-spec";
import { buildNodeDryRun } from "../../../_lib/node-build-dry-run";

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
        dry_run: null,
      });
    }

    const dryRun = buildNodeDryRun(validation.normalized_spec);

    return NextResponse.json({
      ok: true,
      valid: true,
      validation,
      dry_run: dryRun,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        validation: null,
        dry_run: null,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}

