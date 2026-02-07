import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/ap2";
import { getRedis } from "@/app/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeJsonParse(s: any) {
  if (typeof s !== "string") return s;
  try { return JSON.parse(s); } catch { return s; }
}

// Upstash /scan returns { result: [nextCursor, [keys...]] } or similar.
// This helper is defensive and will work even if shape varies slightly.
async function scanKeys(match: string, limit: number) {
  const redis = getRedis();
  let cursor = "0";
  const keys: string[] = [];

  for (let i = 0; i < 50; i++) { // hard stop to prevent runaway
    const path = `/scan/${encodeURIComponent(cursor)}?match=${encodeURIComponent(match)}&count=200`;
    const r = await redis.raw(path);

    if (!r?.ok) break;

    const result = r?.json?.result;
    let nextCursor: string | null = null;
    let batch: string[] = [];

    if (Array.isArray(result) && result.length >= 2) {
      nextCursor = String(result[0]);
      batch = Array.isArray(result[1]) ? result[1].map(String) : [];
    } else if (result?.[0] !== undefined && result?.[1] !== undefined) {
      nextCursor = String(result[0]);
      batch = Array.isArray(result[1]) ? result[1].map(String) : [];
    }

    for (const k of batch) {
      keys.push(k);
      if (keys.length >= limit) return keys;
    }

    if (!nextCursor || nextCursor === "0") break;
    cursor = nextCursor;
  }

  return keys;
}

async function getManyJson(keys: string[]) {
  const redis = getRedis();
  const out: any[] = [];

  for (const k of keys) {
    const v = await redis.get(k);
    if (v === null || v === undefined || v === "") continue;
    out.push({ key: k, value: safeJsonParse(v) });
  }

  return out;
}

export async function POST(req: NextRequest) {
  // OWNER auth: same rule as /api/ap2/*
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(body?.limit ?? 200), 2000));

    // Patterns based on your current retail routes
    const leadKeys     = await scanKeys("hx2:retail:lead:*", limit);
    const waitlistKeys = await scanKeys("hx2:retail:waitlist:*", limit);

    // Pull values
    const leads     = await getManyJson(leadKeys);
    const waitlist  = await getManyJson(waitlistKeys);

    // Sort newest-first if record has ts
    const sortByTsDesc = (a: any, b: any) => {
      const ta = Number(a?.value?.ts ?? a?.value?.createdAt ?? 0);
      const tb = Number(b?.value?.ts ?? b?.value?.createdAt ?? 0);
      return tb - ta;
    };

    leads.sort(sortByTsDesc);
    waitlist.sort(sortByTsDesc);

    return NextResponse.json({
      ok: true,
      exportedAt: new Date().toISOString(),
      limit,
      counts: {
        leads: leads.length,
        waitlist: waitlist.length
      },
      keys: {
        leads: "hx2:retail:lead:*",
        waitlist: "hx2:retail:waitlist:*"
      },
      data: { leads, waitlist }
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "internal_error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
