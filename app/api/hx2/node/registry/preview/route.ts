import { NextRequest, NextResponse } from "next/server";
import { validateNodeSpec } from "../../../_lib/node-spec";
import { previewRegistryEntry } from "../../../_lib/node-registry";

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
        registry_preview: null,
      });
    }

    const registryPreview = previewRegistryEntry(validation.normalized_spec);

    return NextResponse.json({
      ok: true,
      valid: true,
      validation,
      registry_preview: registryPreview,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        validation: null,
        registry_preview: null,
        error: err?.message || "failed",
      },
      { status: 500 }
    );
  }
}
