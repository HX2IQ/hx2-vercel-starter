import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function json(res: any, status = 200) {
  return NextResponse.json(res, { status });
}

function maskUrl(u: string) {
  try {
    const url = new URL(u);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return "bad-url";
  }
}

async function upstash(cmdPath: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  const r = await fetch(`${url}/${cmdPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok}` },
    cache: "no-store",
  });
  const txt = await r.text();
  let data: any = null;
  try { data = JSON.parse(txt); } catch { /* ignore */ }
  if (!r.ok) throw new Error(`Upstash HTTP ${r.status}: ${txt}`);
  if (data && data.error) throw new Error(`Upstash error: ${data.error}`);
  return data;
}

export async function GET(_req: NextRequest) {
  try {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL || "";
    const llen = await upstash(`llen/${encodeURIComponent("ap2:queue")}`);
    const tail = await upstash(`lrange/${encodeURIComponent("ap2:queue")}/-5/-1`);
    // Upstash REST replies: { result: ... }
    return json({
      ok: true,
      upstashRest: maskUrl(restUrl),
      llen: llen?.result ?? null,
      tail: tail?.result ?? null,
    });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, 500);
  }
}
