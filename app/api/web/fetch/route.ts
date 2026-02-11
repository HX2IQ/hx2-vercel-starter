import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type FetchReq = {
  url: string;
};

const ALLOWLIST = new Set<string>([
  "en.wikipedia.org",
  "www.sec.gov",
  "sec.gov",
  "developer.mozilla.org",
  "docs.vercel.com",
  "vercel.com",
  "openai.com",
  "platform.openai.com",
]);

const MAX_BYTES = 250_000;     // hard cap on response body bytes
const MAX_TEXT_CHARS = 60_000; // hard cap on returned text chars
const TIMEOUT_MS = 12_000;

function toHost(u: string): string | null {
  try {
    return new URL(u).host.toLowerCase();
  } catch {
    return null;
  }
}

function isAllowedHost(host: string): boolean {
  if (ALLOWLIST.has(host)) return true;
  // allow subdomains of allowlisted base hosts
  for (const h of ALLOWLIST) {
    if (host === h) return true;
    if (host.endsWith("." + h)) return true;
  }
  return false;
}

function stripHtmlToText(html: string): string {
  // Remove scripts/styles first
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  // Remove tags
  s = s.replace(/<\/?[^>]+>/g, " ");
  // Decode a few common entities (minimal, safe)
  s = s.replace(/&nbsp;/g, " ")
       .replace(/&amp;/g, "&")
       .replace(/&lt;/g, "<")
       .replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'");
  // Normalize whitespace
  s = s.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

async function readWithCap(res: Response, capBytes: number): Promise<{ text: string; bytes: number; truncated: boolean }> {
  const reader = res.body?.getReader();
  if (!reader) {
    const t = await res.text();
    const enc = new TextEncoder();
    const b = enc.encode(t);
    return { text: t, bytes: b.length, truncated: b.length > capBytes };
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  let truncated = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      const remaining = capBytes - total;
      if (remaining <= 0) {
        truncated = true;
        break;
      }
      if (value.length > remaining) {
        chunks.push(value.slice(0, remaining));
        total += remaining;
        truncated = true;
        break;
      }
      chunks.push(value);
      total += value.length;
    }
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(merged);
  return { text, bytes: total, truncated };
}

export async function POST(req: NextRequest) {
  const session = req.headers.get("x-hx2-session") || "";

  let body: FetchReq | null = null;
  try {
    body = (await req.json()) as FetchReq;
  } catch {
    body = null;
  }

  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "Missing url", session },
      { status: 400, headers: { "x-chat-route-version": "webfetch-v0.1" } }
    );
  }

  const host = toHost(url);
  if (!host) {
    return NextResponse.json(
      { ok: false, error: "Invalid url", session },
      { status: 400, headers: { "x-chat-route-version": "webfetch-v0.1" } }
    );
  }

  if (!isAllowedHost(host)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Host not allowlisted",
        session,
        host,
        allowlist: Array.from(ALLOWLIST.values()),
      },
      { status: 403, headers: { "x-chat-route-version": "webfetch-v0.1" } }
    );
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  const startedAt = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Opti-WebFetch/0.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const { text: raw, bytes, truncated } = await readWithCap(res, MAX_BYTES);

    let outText = raw;
    const looksHtml = ct.includes("text/html") || /<html|<body|<div|<p|<title/i.test(raw);
    if (looksHtml) outText = stripHtmlToText(raw);

    if (outText.length > MAX_TEXT_CHARS) {
      outText = outText.slice(0, MAX_TEXT_CHARS) + "\n\n[TRUNCATED_TEXT]";
    }

    const ms = Date.now() - startedAt;

    return NextResponse.json(
      {
        ok: true,
        session,
        source_url: url,
        host,
        fetched_at: new Date().toISOString(),
        status: res.status,
        content_type: ct,
        bytes,
        truncated_bytes: truncated,
        ms,
        text: outText,
      },
      { status: 200, headers: { "x-chat-route-version": "webfetch-v0.1" } }
    );
  } catch (e: any) {
    const ms = Date.now() - startedAt;
    const msg = String(e?.name === "AbortError" ? "Timeout" : (e?.message || e));
    return NextResponse.json(
      { ok: false, session, source_url: url, error: msg, ms },
      { status: 502, headers: { "x-chat-route-version": "webfetch-v0.1" } }
    );
  } finally {
    clearTimeout(t);
  }
}