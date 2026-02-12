param(
  [string]$ChatFile = "app/api/chat/send/route.ts",
  [string]$WebFile  = "app/api/web/search/route.ts"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function WriteUtf8NoBom([string]$path, [string]$content) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $enc)
}

# --- A) Ensure web route exists (replace with canonical v0.3) ---
New-Item -ItemType Directory -Force (Split-Path $WebFile) | Out-Null

$webSrc = @"
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Web Search v0.3
 * Contract (always):
 * {
 *   ok: boolean,
 *   q: string,
 *   fetched_at: string,
 *   n: number,
 *   provider: string,
 *   results: Array<{ title: string, url: string, snippet?: string }>,
 *   error?: string,
 *   upstream_status?: number
 * }
 *
 * Providers:
 * - brave (if BRAVE_API_KEY present)
 * - wikipedia_opensearch (fallback)
 *
 * Reliability:
 * - Redis cache: 1h default
 * - Cooldown backoff on 429/5xx: 2–5 min
 */

type WebResult = { title: string; url: string; snippet?: string };

const UP_URL   = process.env.UPSTASH_REDIS_REST_URL || "";
const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

async function upstash(cmdPath: string) {
  if (!UP_URL || !UP_TOKEN) return null;
  const r = await fetch(\`\${UP_URL}\${cmdPath}\`, {
    headers: { Authorization: \`Bearer \${UP_TOKEN}\` },
    cache: "no-store",
  });
  const json = await r.json().catch(() => null);
  return { status: r.status, json };
}

async function cacheGet(key: string): Promise<string | null> {
  const res = await upstash(\`/get/\${encodeURIComponent(key)}\`);
  if (!res || !res.json) return null;
  // Upstash REST returns: { result: "..." } or { result: null }
  const v = res.json.result;
  return (typeof v === "string" && v.length) ? v : null;
}

async function cacheSetEx(key: string, ttlSeconds: number, value: string) {
  const val = encodeURIComponent(value);
  await upstash(\`/setex/\${encodeURIComponent(key)}/\${ttlSeconds}/\${val}\`);
}

function nowIso() { return new Date().toISOString(); }

function stableShape(q: string, provider: string, results: WebResult[], extra?: Partial<any>) {
  return {
    ok: true,
    q,
    fetched_at: nowIso(),
    n: results.length,
    provider,
    results,
    ...(extra || {})
  };
}

function stableError(q: string, provider: string, error: string, extra?: Partial<any>) {
  return {
    ok: false,
    q,
    fetched_at: nowIso(),
    n: 0,
    provider,
    results: [],
    error,
    ...(extra || {})
  };
}

async function wikipediaOpenSearch(q: string): Promise<{ ok: boolean; results: WebResult[]; upstream_status?: number; error?: string }> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("namespace", "0");
  url.searchParams.set("format", "json");

  const r = await fetch(url.toString(), { headers: { "user-agent": "hx2-web/0.3" }, cache: "no-store" });
  const status = r.status;

  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return { ok: false, results: [], upstream_status: status, error: \`wiki failed (\${status})\${body ? "" : ""}\` };
  }

  const data = await r.json().catch(() => null) as any;
  const titles: string[] = Array.isArray(data?.[1]) ? data[1] : [];
  const urls: string[]   = Array.isArray(data?.[3]) ? data[3] : [];

  const results: WebResult[] = [];
  for (let i = 0; i < Math.min(titles.length, urls.length); i++) {
    const t = String(titles[i] || "").trim();
    const u = String(urls[i] || "").trim();
    if (t && u) results.push({ title: t, url: u });
  }

  return { ok: true, results, upstream_status: status };
}

async function braveSearch(q: string): Promise<{ ok: boolean; results: WebResult[]; upstream_status?: number; error?: string }> {
  const key = process.env.BRAVE_API_KEY || "";
  if (!key) return { ok: false, results: [], error: "BRAVE_API_KEY missing" };

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", q);
  url.searchParams.set("count", "8");

  const r = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": key,
      "User-Agent": "hx2-web/0.3"
    },
    cache: "no-store"
  });

  const status = r.status;

  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return { ok: false, results: [], upstream_status: status, error: \`brave failed (\${status})\` + (body ? "" : "") };
  }

  const j = await r.json().catch(() => null) as any;
  const items = Array.isArray(j?.web?.results) ? j.web.results : [];

  const results: WebResult[] = items.slice(0, 8).map((it: any) => ({
    title: String(it?.title || "").trim(),
    url: String(it?.url || "").trim(),
    snippet: it?.description ? String(it.description) : undefined
  })).filter((x: WebResult) => x.title && x.url);

  return { ok: true, results, upstream_status: status };
}

export async function POST(req: NextRequest) {
  const providerChain = (process.env.HX2_WEB_PROVIDER_CHAIN || "brave,wikipedia_opensearch")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const body = await req.json().catch(() => ({} as any));
  const q = String(body?.q || body?.query || "").trim();

  const provider = providerChain.join(">");
  const fetched_at = nowIso();

  if (!q) {
    return NextResponse.json(stableError("", provider, "missing q"), { status: 400 });
  }

  // ---- cache keys ----
  // NOTE: no crypto import needed; Node has global require in runtime=nodejs builds, but keep it explicit:
  const crypto = await import("crypto");
  const qHash = crypto.createHash("sha1").update(q.toLowerCase().replace(/\\s+/g, " ").trim()).digest("hex");
  const cacheKey = \`hx2:web:cache:\${qHash}\`;
  const coolKey  = \`hx2:web:cooldown:\${providerChain[0] || "web"}\`;

  // cooldown breaker (429/5xx protection)
  const cool = await cacheGet(coolKey);
  if (cool) {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // ensure stable shape even if old cache
      return NextResponse.json({ ...stableShape(q, parsed.provider || "cache", parsed.results || []), cache: "HIT_COOLDOWN" }, { status: 200 });
    }
    return NextResponse.json(stableError(q, provider, "cooldown active; no cache"), { status: 200 });
  }

  // normal cache
  const hit = await cacheGet(cacheKey);
  if (hit) {
    const parsed = JSON.parse(hit);
    return NextResponse.json({ ...stableShape(q, parsed.provider || "cache", parsed.results || []), cache: "HIT" }, { status: 200 });
  }

  // ---- provider chain ----
  let lastErr: any = null;

  for (const p of providerChain) {
    try {
      if (p === "brave") {
        const r = await braveSearch(q);
        if (r.ok && r.results.length) {
          const payload = stableShape(q, "brave", r.results, { upstream_status: r.upstream_status, fetched_at });
          await cacheSetEx(cacheKey, Number(process.env.HX2_WEB_CACHE_TTL || "3600"), JSON.stringify(payload));
          return NextResponse.json(payload, { status: 200 });
        }
        lastErr = r;
        // backoff on rate limits / 5xx
        if (r.upstream_status === 429 || (r.upstream_status && r.upstream_status >= 500)) {
          await cacheSetEx(coolKey, Number(process.env.HX2_WEB_COOLDOWN_TTL || "180"), "1");
          break;
        }
      }

      if (p === "wikipedia_opensearch") {
        const r = await wikipediaOpenSearch(q);
        if (r.ok) {
          const payload = stableShape(q, "wikipedia_opensearch", r.results, { upstream_status: r.upstream_status, fetched_at });
          await cacheSetEx(cacheKey, Number(process.env.HX2_WEB_CACHE_TTL || "3600"), JSON.stringify(payload));
          return NextResponse.json(payload, { status: 200 });
        }
        lastErr = r;
        if (r.upstream_status === 429 || (r.upstream_status && r.upstream_status >= 500)) {
          await cacheSetEx(coolKey, Number(process.env.HX2_WEB_COOLDOWN_TTL || "180"), "1");
          break;
        }
      }
    } catch (e: any) {
      lastErr = { ok: false, error: String(e?.message || e) };
    }
  }

  // stable error response (never throw, never change keys)
  const upstream_status = lastErr?.upstream_status;
  const errMsg = lastErr?.error || "no results";
  return NextResponse.json(stableError(q, provider, errMsg, { upstream_status }), { status: 200 });
}
"@

WriteUtf8NoBom $WebFile $webSrc
Write-Host "OK: wrote $WebFile (web v0.3)"

# --- B) Patch chat/send to call web search using absolute URL + keep stable web keys ---
if (!(Test-Path $ChatFile)) { throw "Missing $ChatFile" }
$src = Get-Content $ChatFile -Raw

# 1) Ensure message is defined once
# (we won't try to perfectly refactor your file; we just harden the web-call to avoid relative URL failures)
if ($src -notmatch 'new URL\("/api/web/search"') {
  # Insert helper function near top of POST handler after req.json line
  $anchor = 'const body = await req\.json\(\)\.catch\(\(\) => \(\{\} as any\)\);'
  if ($src -notmatch $anchor) { throw "Anchor not found in $ChatFile: tolerant body parse line" }

  $insert = @"
const __hx2WebSearchUrl = new URL("/api/web/search", req.url).toString();
"@

  $src = [regex]::Replace($src, $anchor, ('$0' + "`n" + $insert), 1)
  Write-Host "OK: inserted __hx2WebSearchUrl"
}

# 2) Replace any fetch("/api/web/search" ...) or fetch(`/api/web/search` ...) with fetch(__hx2WebSearchUrl ...)
$src = $src -replace 'fetch\(\s*`?/api/web/search[^`"]*`?\s*,', 'fetch(__hx2WebSearchUrl,'

# 3) Ensure web keys always exist in responses.
# If you already return web: {...} in success/error, we keep it.
# We only fix the specific "Failed to parse URL from /api/web/search" situation by making URL absolute.
WriteUtf8NoBom $ChatFile $src
Write-Host "OK: patched $ChatFile (absolute web URL + hardened fetch call)"