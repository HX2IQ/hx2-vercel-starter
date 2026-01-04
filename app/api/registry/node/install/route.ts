import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KV_REST_API_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_REST_API_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

async function kvGet(key: string) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  const r = await fetch(`${KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    cache: "no-store"
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.result ?? null;
}

async function kvSet(key: string, value: string) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) throw new Error("KV not configured");
  const r = await fetch(`${KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(value),
    cache: "no-store"
  });
  if (!r.ok) throw new Error(`KV set failed: ${r.status}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const node = body?.node;
    if (!node?.id) {
      return NextResponse.json({ ok: false, error: "Missing node.id" }, { status: 400 });
    }

    // Read existing nodes
    const raw = await kvGet("hx2:registry:nodes");
    const nodes = raw ? JSON.parse(raw) : [];

    // Upsert by id
    const idx = nodes.findIndex((n: any) => n?.id === node.id);
    if (idx >= 0) nodes[idx] = { ...nodes[idx], ...node };
    else nodes.push(node);

    await kvSet("hx2:registry:nodes", JSON.stringify(nodes));

    return NextResponse.json(
      { ok: true, route: "registry.node.install", mode: body?.mode || "SAFE", nodeId: node.id, ts: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "install failed" }, { status: 500 });
  }
}
