import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Minimal in-memory rate limiter (per-region/per-instance).
 * Good enough for early production. Later swap to Upstash for global enforcement.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;  // 1 minute
const MAX_PER_WINDOW = 60; // 60 req/min per IP

function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    const nb = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(ip, nb);
    return { ok: true, remaining: MAX_PER_WINDOW - 1, resetAt: nb.resetAt };
  }
  b.count += 1;
  buckets.set(ip, b);
  return { ok: b.count <= MAX_PER_WINDOW, remaining: Math.max(0, MAX_PER_WINDOW - b.count), resetAt: b.resetAt };
}

function jsonNoCache(data: any, init?: ResponseInit) {
  const res = NextResponse.json(data, init);
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  return res;
}

type Body = { mode: "SAFE"; query: string };

function validateBody(x: any): { ok: true; body: Body } | { ok: false; message: string } {
  if (!x || typeof x !== "object") return { ok: false, message: "Body must be a JSON object" };
  if (x.mode !== "SAFE") return { ok: false, message: "mode must be SAFE" };
  if (typeof x.query !== "string") return { ok: false, message: "query must be a string" };

  const q = x.query.trim();
  if (!q) return { ok: false, message: "query is required" };
  if (q.length > 500) return { ok: false, message: "query too long (max 500 chars)" };

  return { ok: true, body: { mode: "SAFE", query: q } };
}

export async function OPTIONS() {
  // Minimal CORS-safe preflight; customize if you later need cross-origin calls.
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-HX2-Internal",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    const retryAfterSec = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    const res = jsonNoCache(
      { ok: false, service: "h2", endpoint: "/api/h2/run", error: { code: "rate_limited", message: "Too many requests" } },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(retryAfterSec));
    res.headers.set("X-RateLimit-Limit", String(MAX_PER_WINDOW));
    res.headers.set("X-RateLimit-Remaining", "0");
    res.headers.set("X-RateLimit-Reset", String(rl.resetAt));
    return res;
  }

  let raw: any = null;
  try {
    raw = await req.json();
  } catch {
    return jsonNoCache(
      { ok: false, service: "h2", endpoint: "/api/h2/run", error: { code: "bad_json", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const v = validateBody(raw);
  if (!v.ok) {
    return jsonNoCache(
      { ok: false, service: "h2", endpoint: "/api/h2/run", error: { code: "bad_request", message: v.message } },
      { status: 400 }
    );
  }

  const { query } = v.body;

  // ---- H2 SAFE stub logic (keep it deterministic + no external calls) ----
  if (query === "status") {
    return jsonNoCache({
      ok: true,
      service: "h2",
      endpoint: "/api/h2/run",
      result: {
        node: "h2-oi",
        mode: "SAFE",
        input: { query },
        output: {
          regime: "Calm",
          summary: "H2 is online. SAFE contract v1. No external intel sources queried.",
          signals: [
            { key: "connectivity", level: "green", note: "API reachable" },
            { key: "adapters", level: "yellow", note: "OSINT/web adapters disabled (SAFE)" },
          ],
          next_actions: [
            "Wire /oi/h2 UI to POST /api/h2/run and render cards.",
            "Add schema validation + rate limiting.",
            "Add owner-only adapter toggles (web/osint) later.",
          ],
        },
      },
      ts: new Date().toISOString(),
    });
  }

  if (query === "caps") {
    return jsonNoCache({
      ok: true,
      service: "h2",
      endpoint: "/api/h2/run",
      result: {
        node: "h2-oi",
        mode: "SAFE",
        input: { query },
        output: {
          regime: "Calm",
          summary: "Capabilities (SAFE).",
          adapters: {
            web_search: false,
            osint: false,
            rss: false,
            markets: false,
          },
        },
      },
      ts: new Date().toISOString(),
    });
  }

  if (query.startsWith("echo:")) {
    const text = query.slice("echo:".length).trim();
    return jsonNoCache({
      ok: true,
      service: "h2",
      endpoint: "/api/h2/run",
      result: {
        node: "h2-oi",
        mode: "SAFE",
        input: { query },
        output: {
          regime: "Calm",
          summary: "Echo response (SAFE).",
          signals: [{ key: "mode", level: "green", note: "SAFE" }],
          echo: { text, length: text.length },
        },
      },
      ts: new Date().toISOString(),
    });
  }

  // default
  return jsonNoCache({
    ok: true,
    service: "h2",
    endpoint: "/api/h2/run",
    result: {
      node: "h2-oi",
      mode: "SAFE",
      input: { query },
      output: {
        regime: "Calm",
        summary: "Unknown query (SAFE). Try: status | caps | echo:<text>",
        signals: [{ key: "query", level: "yellow", note: "Unknown command" }],
      },
    },
    ts: new Date().toISOString(),
  });
}


