import { NextResponse } from "next/server";
import { buildKgxContextTags } from "../_lib/kgx-context-tags";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    "";

  return NextResponse.json({
    ok: true,
    kgx_context_tags_preview_active: true,
    request: q,
    context: buildKgxContextTags(q)
  });
}
