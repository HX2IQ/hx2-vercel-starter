import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

export const runtime = "nodejs";

function j(status: number, data: any) {
  return NextResponse.json(data, { status });
}
function enc(s: string) { return encodeURIComponent(s); }

async function restCmd(base: string, token: string, path: string) {
  const url = `${base.replace(/\/+$/,"")}${path}`;
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  const txt = await r.text();
  let parsed: any = null; try { parsed = JSON.parse(txt); } catch {}
  return { http: r.status, raw: txt, parsed };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = (url.searchParams.get("key") || process.env.AP2_QUEUE_KEY || "ap2:queue_v2").trim();

  const redisUrl = (process.env.REDIS_URL || "").trim();
  const restUrl  = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const restTok  = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

  try {
    if (restUrl && restTok) {
      const typeRes   = await restCmd(restUrl, restTok, `/TYPE/${enc(key)}`);
      const llenRes   = await restCmd(restUrl, restTok, `/LLEN/${enc(key)}`);
      const lrangeRes = await restCmd(restUrl, restTok, `/LRANGE/${enc(key)}/0/10`);
      return j(200, {
        ok: true,
        backend: "upstash-rest",
        key,
        queueType: typeRes.parsed?.result ?? "unknown",
        llen: llenRes.parsed ?? { result: null },
        lrange: lrangeRes.parsed ?? { result: null },
        envDbg: { hasRest: true, hasRedisUrl: !!redisUrl, hasQueueKeyEnv: !!process.env.AP2_QUEUE_KEY }
      });
    }

    if (redisUrl) {
      const r = new Redis(redisUrl, { tls: redisUrl.startsWith("rediss://") ? {} : undefined });
      const type = await r.type(key);
      const llen = (type === "list") ? await r.llen(key) : 0;
      const lrange = (type === "list") ? await r.lrange(key, 0, 10) : [];
      await r.quit();
      return j(200, {
        ok: true,
        backend: "tcp",
        key,
        queueType: type,
        llen: { result: llen },
        lrange: { result: lrange },
        envDbg: { hasRest: false, hasRedisUrl: true, hasQueueKeyEnv: !!process.env.AP2_QUEUE_KEY }
      });
    }

    return j(500, { ok: false, error: "No Redis configured" });
  } catch (e: any) {
    return j(500, { ok: false, error: e?.message || String(e) });
  }
}
