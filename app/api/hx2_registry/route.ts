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

export async function GET() {
  const raw = await kvGet("hx2:registry:nodes");
  const nodes = raw ? JSON.parse(raw) : [];
  return NextResponse.json(
    { ok: true, service: "hx2_registry", mode: "SAFE", nodes, ts: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}








