import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok(data: any) {
  return NextResponse.json({ ok: true, ...data, ts: new Date().toISOString() });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message, ts: new Date().toISOString() }, { status });
}

async function lookupWikipedia(entity: string) {
  const title = encodeURIComponent(entity.trim().replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "OptinodeIQ-HX2-Wiki/1.0",
      "Accept": "application/json"
    },
    cache: "no-store"
  });

  const data = await res.json().catch(() => ({}));

  return {
    httpStatus: res.status,
    data
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity");

  if (!entity) {
    return ok({
      service: "wiki-oi",
      usage: {
        lookup: "/api/nodes/wiki-oi?entity=Ripple Labs"
      }
    });
  }

  try {
    const result = await lookupWikipedia(entity);

    return ok({
      service: "wiki-oi",
      entity,
      result: {
        httpStatus: result.httpStatus,
        title: result.data?.title ?? null,
        description: result.data?.description ?? null,
        extract: result.data?.extract ?? null,
        content_urls: result.data?.content_urls ?? null
      }
    });
  } catch (err: any) {
    return fail(`Wikipedia lookup failed: ${err?.message || String(err)}`, 502);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const entity = body?.entity ?? null;

  if (!entity) {
    return fail("entity is required");
  }

  try {
    const result = await lookupWikipedia(entity);

    return ok({
      service: "wiki-oi",
      received: {
        entity
      },
      result: {
        httpStatus: result.httpStatus,
        title: result.data?.title ?? null,
        description: result.data?.description ?? null,
        extract: result.data?.extract ?? null,
        content_urls: result.data?.content_urls ?? null
      }
    });
  } catch (err: any) {
    return fail(`Wikipedia lookup failed: ${err?.message || String(err)}`, 502);
  }
}
