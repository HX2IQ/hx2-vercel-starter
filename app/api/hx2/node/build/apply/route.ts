import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { validateNodeSpec } from "../../../_lib/node-spec";
import { applyNodeBuild } from "../../../_lib/node-build-apply";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ownerMode = Boolean(body?.owner_mode);

    if (!ownerMode) {
      return NextResponse.json(
        {
          ok: false,
          error: "owner_mode=true is required",
        },
        { status: 403 }
      );
    }

    const validation = validateNodeSpec(body);

    if (!validation.valid || !validation.normalized_spec) {
      return NextResponse.json({
        ok: false,
        valid: false,
        validation,
        apply: null,
      });
    }

    const rootDir = process.cwd();
    const apply = applyNodeBuild(validation.normalized_spec, rootDir);

    return NextResponse.json({
      ok: true,
      valid: true,
      validation,
      apply,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        validation: null,
        apply: null,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}
