import { NextRequest, NextResponse } from "next/server";
import { validateNodeSpec } from "../../../_lib/node-spec";
import { previewRegistryEntry } from "../../../_lib/node-registry";
import { applyRegistryEntry } from "../../../_lib/node-registry-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ownerMode = Boolean(body?.owner_mode);

    if (!ownerMode) {
      return NextResponse.json(
        { ok: false, error: "owner_mode=true required" },
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

    const preview = previewRegistryEntry(validation.normalized_spec);
    const result = applyRegistryEntry(process.cwd(), preview.entry);

    return NextResponse.json({
      ok: true,
      valid: true,
      validation,
      registry_apply: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}
