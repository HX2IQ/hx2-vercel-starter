param(
  [string]$ChatFile = "app/api/chat/send/route.ts",
  [string]$WebFile  = "app/api/web/search/route.ts",
  [string]$PkgFile  = "package.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function WriteUtf8NoBom([string]$path, [string]$content) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $enc)
}

# -------------------------
# 1) Ensure fast-xml-parser dep (tiny, reliable)
# -------------------------
if (!(Test-Path $PkgFile)) { throw "Missing $PkgFile" }
$pkg = Get-Content $PkgFile -Raw | ConvertFrom-Json

if (-not $pkg.dependencies) { $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue (@{}) }
if (-not $pkg.dependencies.'fast-xml-parser') {
  $pkg.dependencies.'fast-xml-parser' = "^4.5.0"
  Write-Host "OK: added dependency fast-xml-parser"
} else {
  Write-Host "OK: dependency fast-xml-parser already present"
}

# Write package.json back (preserve formatting reasonably)
$pkgJson = ($pkg | ConvertTo-Json -Depth 30)
WriteUtf8NoBom $PkgFile $pkgJson

# -------------------------
# 2) Write canonical /api/web/search route v0.4 (RSS added)
# -------------------------
New-Item -ItemType Directory -Force (Split-Path $WebFile) | Out-Null

$webSrc = @"
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebResult = { title: string; url: string; snippet?: string; source?: string };

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
  const v = res?.json?.result;
  return (typeof v === "string" && v.length) ? v : null;
}

async function cacheSetEx(key: string, ttlSeconds: number, value: string) {
  const val = encodeURIComponent(value);
  await upstash(\`/setex/\${encodeURIComponent(key)}/\${ttlSeconds}/\${val}\`);
}

function nowIso() { return new Date().toISOString(); }

function stableOk(q: string, provider: string, results: WebResult[], extra?: any) {
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

function stableErr(q: string, provider: string, error: string, extra?: any) {
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

async function wikipediaOpenSearch(q: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("namespace", "0");
  url.searchParams.set("format", "json");

  const r = await fetch(url.toString(), { headers: { "user-agent": "hx2-web/0.4" }, cache: "no-store" });
  const status = r.status;

  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return { ok: false, results: [] as WebResult[], upstream_status: status, error: \`wiki failed (\${status})\`, body };
  }

  const data = await r.json().catch(() => null) as any;
  const titles: string[] = Array.isArray(data?.[1]) ? data[1] : [];
  const urls: string[]   = Array.isArray(data?.[3]) ? data[3] : [];

  const results: WebResult[] = [];
  for (let i = 0; i < Math.min(titles.length, urls.length); i++) {
    const t = String(titles[i] || "").trim();
    const u = String(urls[i] || "").trim();
    if (t && u) results.push({ title: t, url: u, snippet: "", source: "wikipedia" });
  }

  return { ok: true, results, upstream_status: status };
}

async function braveSearch(q: string) {
  const key = process.env.BRAVE_API_KEY || "";
  if (!key) return { ok: false, results: [] as WebResult[], error: "BRAVE_API_KEY missing" };

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", q);
  url.searchParams.set("count", "8");

  const r = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": key,
      "User-Agent": "hx2-web/0.4"
    },
    cache: "no-store"
  });

  const status = r.status;

  if (!r.ok) {
    await r.text().catch(() => "");
    return { ok: false, results: [] as WebResult[], upstream_status: status, error: \`brave failed (\${status})\` };
  }

  const j = await r.json().catch(() => null) as any;
  const items = Array.isArray(j?.web?.results) ? j.web.results : [];

  const results: WebResult[] = items.slice(0, 8).map((it: any) => ({
    title: String(it?.title || "").trim(),
    url: String(it?.url || "").trim(),
    snippet: it?.description ? String(it.description) : "",
    source: "brave"
  })).filter((x: WebResult) => x.title && x.url);

  return { ok: true, results, upstream_status: status };
}

async function rssGoogleNews(q: string) {
  // Free RSS search endpoint (Google News). No key.
  // Reliability: depends on rate limits; cache + cooldown makes it workable.
  const { XMLParser } = await import("fast-xml-parser");

  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", q);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const r = await fetch(url.toString(), {
    headers: { "user-agent": "hx2-web/0.4" },
    cache: "no-store",
  });

  const status = r.status;

  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return { ok: false, results: [] as WebResult[], upstream_status: status, error: \`rss failed (\${status})\`, body };
  }

  const xml = await r.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const j = parser.parse(xml) as any;

  const items = j?.rss?.channel?.item
    ? (Array.isArray(j.rss.channel.item) ? j.rss.channel.item : [j.rss.channel.item])
    : [];

  const results: WebResult[] = items.slice(0, 8).map((it: any) => {
    const title = String(it?.title || "").trim();
    const link  = String(it?.link || "").trim();
    const desc  = String(it?.description || "").replace(/<[^>]+>/g, "").trim();
    return { title, url: link, snippet: desc, source: "rss_google_news" };
  }).filter((x: WebResult) => x.title && x.url);

  return { ok: true, results, upstream_status: status };
}

export async function POST(req: NextRequest) {
  const chain = (process.env.HX2_WEB_PROVIDER_CHAIN || "brave,rss_google_news,wikipedia_opensearch")
    .split(",").map(s => s.trim()).filter(Boolean);

  const body = await req.json().catch(() => ({} as any));
  const q = String(body?.q || body?.query || "").trim();
  const provider = chain.join(">");

  if (!q) return NextResponse.json(stableErr("", provider, "missing q"), { status: 400 });

  const crypto = await import("crypto");
  const qHash = crypto.createHash("sha1")
    .update(q.toLowerCase().replace(/\\s+/g, " ").trim())
    .digest("hex");

  const cacheKey = \`hx2:web:cache:\${qHash}\`;
  const coolKey  = \`hx2:web:cooldown:\${chain[0] || "web"}\`;

  const cool = await cacheGet(coolKey);
  if (cool) {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return NextResponse.json({ ...stableOk(q, parsed.provider || "cache", parsed.results || []), cache: "HIT_COOLDOWN" }, { status: 200 });
    }
    return NextResponse.json(stableErr(q, provider, "cooldown active; no cache"), { status: 200 });
  }

  const hit = await cacheGet(cacheKey);
  if (hit) {
    const parsed = JSON.parse(hit);
    return NextResponse.json({ ...stableOk(q, parsed.provider || "cache", parsed.results || []), cache: "HIT" }, { status: 200 });
  }

  let last: any = null;

  for (const p of chain) {
    try {
      if (p === "brave") {
        const r = await braveSearch(q);
        if (r.ok && r.results.length) {
          const payload = stableOk(q, "brave", r.results, { upstream_status: r.upstream_status });
          await cacheSetEx(cacheKey, Number(process.env.HX2_WEB_CACHE_TTL || "3600"), JSON.stringify(payload));
          return NextResponse.json(payload, { status: 200 });
        }
        last = r;
        if (r.upstream_status === 429 || (r.upstream_status && r.upstream_status >= 500)) {
          await cacheSetEx(coolKey, Number(process.env.HX2_WEB_COOLDOWN_TTL || "180"), "1");
          break;
        }
      }

      if (p === "rss_google_news") {
        const r = await rssGoogleNews(q);
        if (r.ok && r.results.length) {
          const payload = stableOk(q, "rss_google_news", r.results, { upstream_status: r.upstream_status });
          await cacheSetEx(cacheKey, Number(process.env.HX2_WEB_CACHE_TTL || "3600"), JSON.stringify(payload));
          return NextResponse.json(payload, { status: 200 });
        }
        last = r;
        if (r.upstream_status === 429 || (r.upstream_status && r.upstream_status >= 500)) {
          await cacheSetEx(coolKey, Number(process.env.HX2_WEB_COOLDOWN_TTL || "180"), "1");
          break;
        }
      }

      if (p === "wikipedia_opensearch") {
        const r = await wikipediaOpenSearch(q);
        if (r.ok) {
          const payload = stableOk(q, "wikipedia_opensearch", r.results, { upstream_status: r.upstream_status });
          await cacheSetEx(cacheKey, Number(process.env.HX2_WEB_CACHE_TTL || "3600"), JSON.stringify(payload));
          return NextResponse.json(payload, { status: 200 });
        }
        last = r;
        if (r.upstream_status === 429 || (r.upstream_status && r.upstream_status >= 500)) {
          await cacheSetEx(coolKey, Number(process.env.HX2_WEB_COOLDOWN_TTL || "180"), "1");
          break;
        }
      }
    } catch (e: any) {
      last = { ok: false, error: String(e?.message || e) };
    }
  }

  const upstream_status = last?.upstream_status;
  const err = last?.error || "no results";
  return NextResponse.json(stableErr(q, provider, err, { upstream_status }), { status: 200 });
}
"@

WriteUtf8NoBom $WebFile $webSrc
Write-Host "OK: wrote $WebFile (web v0.4 RSS added)"

# -------------------------
# 3) Patch /api/chat/send to NEVER use relative /api/web/search
# -------------------------
if (!(Test-Path $ChatFile)) { throw "Missing $ChatFile" }
$src = Get-Content $ChatFile -Raw

# Ensure helper absolute URL exists (idempotent)
if ($src -notmatch '__hx2WebSearchUrl') {
  $anchor = 'const body = await req\.json\(\)\.catch\(\(\) => \(\{\} as any\)\);'
  if ($src -notmatch $anchor) { throw "Anchor not found in $ChatFile: tolerant body parse line" }

  $insert = @"
const __hx2WebSearchUrl = new URL("/api/web/search", req.url).toString();
"@
  $src = [regex]::Replace($src, $anchor, ('$0' + "`n" + $insert), 1)
  Write-Host "OK: inserted __hx2WebSearchUrl in chat route"
}

# Replace all fetch calls that reference /api/web/search with the absolute helper
$src = [regex]::Replace($src, 'fetch\(\s*([`"''`]?)/api/web/search[^`"''\)]*\1\s*,', 'fetch(__hx2WebSearchUrl,', "IgnoreCase")

# Also fix any new URL("/api/web/search") without base (just in case)
$src = [regex]::Replace($src, 'new URL\(\s*([`"''`]?)/api/web/search\1\s*\)', 'new URL("/api/web/search", req.url)', "IgnoreCase")

WriteUtf8NoBom $ChatFile $src
Write-Host "OK: patched $ChatFile (absolute /api/web/search only)"