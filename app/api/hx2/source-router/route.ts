import { NextRequest, NextResponse } from "next/server";
import { classifyQuery } from "../_lib/query-intelligence";

export const runtime = "nodejs";

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, status: res.status, data };
}

function clean(s: unknown) {
  return String(s || "").trim();
}

function prefersYouTube(query: string): boolean {
  const q = clean(query).toLowerCase();

  if (/(youtube|video|videos|transcript|watch|podcast|interview|channel)/.test(q)) return true;
  if (/(summarize .*video|what does this video say|find a video|show me videos|search youtube)/.test(q)) return true;

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const q = clean(body?.q || body?.query || body?.text || body?.message);
    const limitRaw = Number(body?.limit ?? 5);
    const limit = Math.max(1, Math.min(10, Number.isFinite(limitRaw) ? limitRaw : 5));

    if (!q) {
      return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });
    }

    const baseUrl =
      process.env.BASE_URL ||
      req.nextUrl.origin ||
      "https://optinodeiq.com";

    const queryClassification = classifyQuery(q);
    const routeTarget = prefersYouTube(q) ? "youtube" : "web";
    const routePath =
      routeTarget === "youtube"
        ? "/api/hx2/youtube/local-first"
        : "/api/hx2/web/local-first";

    const routed = await postJson(baseUrl + routePath, {
      q,
      limit,
    });

    if (!routed?.data?.ok) {
      return NextResponse.json({
        ok: false,
        error: "source routing failed",
        routed_to: routeTarget,
        query_classification: queryClassification,
        detail: routed?.data || null,
      }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      routed_to: routeTarget,
      query_classification: queryClassification,
      result: routed.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
