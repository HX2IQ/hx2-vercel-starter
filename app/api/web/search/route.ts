import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function decodeDuckDuckGoRedirect(href: string): string {
  // DuckDuckGo uses /l/?uddg=<encoded>
  try {
    const u = new URL("https://duckduckgo.com" + href);
    const uddg = u.searchParams.get("uddg");
    if (!uddg) return "";
    return decodeURIComponent(uddg);
  } catch {
    return "";
  }
}

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const q = String(body?.q || body?.query || "").trim();
    const n = Math.max(1, Math.min(5, Number(body?.n ?? 3)));

    if (!q) {
      return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });
    }

    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=us-en`;

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 10000);

    const r = await fetch(url, {
      method: "GET",
      signal: ac.signal,
      headers: {
        "User-Agent": "HX2-WebSearch/0.1 (+https://optinodeiq.com)",
        "Accept": "text/html",
      },
      cache: "no-store",
    }).finally(() => clearTimeout(to));

    const html = await r.text();
    // Result links look like: <a rel="nofollow" class="result__a" href="/l/?kh=...&uddg=ENCODED">Title</a>
    const links: Array<{ url: string; title: string }> = [];

    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;

    while ((m = re.exec(html)) && links.length < n) {
      const href = m[1] || "";
      const titleHtml = m[2] || "";
      const title = stripHtml(titleHtml);

      let outUrl = "";
      if (href.startsWith("/l/?")) outUrl = decodeDuckDuckGoRedirect(href);
      else if (href.startsWith("http")) outUrl = href;

      if (!outUrl) continue;
      links.push({ url: outUrl, title });
    }

    return NextResponse.json({
      ok: true,
      q,
      fetched_at: new Date().toISOString(),
      n: links.length,
      results: links,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}