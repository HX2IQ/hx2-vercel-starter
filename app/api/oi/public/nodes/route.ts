import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeJsonParse(s: any) {
  if (typeof s !== "string") return s;
  try { return JSON.parse(s); } catch { return null; }
}

function isPublicNode(nodeId: string, node: any) {
  // Allowlist rules (public-safe defaults)
  const t = String(node?.type || "").toLowerCase();

  // Explicit flag wins if present
  const vis = String(node?.visibility || node?.public || "").toLowerCase();
  if (vis === "public" || vis === "true") return true;

  // Retail/OI node types
  if (t.includes("retail")) return true;
  if (t.includes("oi")) return true;

  // Naming conventions
  if (nodeId.startsWith("oi-")) return true;
  if (nodeId.toLowerCase().includes("healthoi")) return true;

  return false;
}

function pickPublicFields(nodeId: string, node: any) {
  return {
    id: nodeId,
    type: node?.type ?? null,
    version: node?.version ?? null,
    name: node?.name ?? null,
    description: node?.description ?? null,
    // keep public-facing metadata only
    tags: node?.tags ?? null,
    updatedAt: node?.updatedAt ?? node?.ts ?? null,
  };
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { ok: false, error: "redis_not_configured" },
      { status: 500 }
    );
  }

  // These are the common keys we’ve been using in this repo.
  // If your registry uses a different key, we’ll adjust after a quick check.
  const indexKey = "hx2:registry:nodes:index";
  const recordPrefix = "hx2:registry:nodes:";

  try {
    const ids = (await redis.smembers(indexKey)) as any[] || [];

    const out: any[] = [];
    for (const idAny of ids) {
      const nodeId = String(idAny || "").trim();
      if (!nodeId) continue;

      const raw = await redis.get(`${recordPrefix}${nodeId}`);
      const node = safeJsonParse(raw);

      // If record is bad JSON, skip instead of breaking the page
      if (!node || typeof node !== "object") continue;

      if (isPublicNode(nodeId, node)) {
        out.push(pickPublicFields(nodeId, node));
      }
    }

    // Sort by id for stable display
    out.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    return NextResponse.json({
      ok: true,
      count: out.length,
      nodes: out,
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "internal_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
