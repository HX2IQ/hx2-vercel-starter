import { NextRequest, NextResponse } from "next/server";
import { listNodes } from "@/lib/registryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const nodeId = String(body?.node || body?.id || "").trim();

    if (!nodeId) {
      return NextResponse.json({ ok: false, error: "missing_node" }, { status: 400 });
    }

    const nodes = await listNodes();
    const found = nodes?.some((n: any) => String(n?.id || "") === nodeId) || false;

    if (!found) {
      return NextResponse.json({ ok: false, error: "node_not_found", node: nodeId }, { status: 404 });
    }

    // SAFE: infra-only ping (no brain access, no external fetch)
    return NextResponse.json({
      ok: true,
      mode: "SAFE",
      node: nodeId,
      reply: "pong",
      ts: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "internal_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
