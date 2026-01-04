import { NextResponse } from "next/server";
import { upsertNode } from "../../../../../lib/registryStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any = null;
  try { body = await req.json(); } catch {}

  const node = body?.node;
  const id = node?.id;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ ok: false, error: "missing node.id" }, { status: 400 });
  }

  // SAFE-only acceptance here (matches your current posture)
  const mode = (body?.mode || "SAFE").toUpperCase();
  if (mode !== "SAFE") {
    return NextResponse.json({ ok: false, error: "mode must be SAFE" }, { status: 400 });
  }

  const { ok, count } = await upsertNode(node);

  return NextResponse.json({
    ok: true,
    route: "registry.node.install",
    mode: "SAFE",
    stored: ok,
    nodeId: id,
    count,
    ts: new Date().toISOString()
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
