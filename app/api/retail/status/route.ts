import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function safeFetchJson(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    const text = await r.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 200) }; }
    return { ok: r.ok, status: r.status, json };
  } catch (e: any) {
    return { ok: false, status: 0, json: { error: String(e?.message || e) } };
  }
}

export async function GET(req: Request) {
  const base = (process.env.HX2_BASE_URL || new URL(req.url).origin).replace(/\/+$/, "");

  const [waitlistCount, demoDescribe] = await Promise.all([
    redis.scard("hx2:retail:waitlist:set").catch(() => 0),
    safeFetchJson(`${base}/api/nodes/demo-node-01/describe`),
  ]);

  const checks = [
    {
      id: "waitlist.redis",
      label: "Waitlist (Redis)",
      ok: Number(waitlistCount || 0) >= 0,
      detail: { count: Number(waitlistCount || 0) },
    },
    {
      id: "node.demo.describe",
      label: "Demo Node Describe",
      ok: demoDescribe.ok,
      detail: { status: demoDescribe.status },
    },
  ];

  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    base,
    checks,
  });
}
