import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const target = `${Gateway}/api/ap2/status${url.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      // forward auth if present
      "Authorization": req.headers.get("authorization") || "",
    },
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    try { init.body = await req.text(); } catch {}
  }

  const r = await fetch(target, init);
  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest)  { return proxy(req); }
export async function POST(req: NextRequest) { return proxy(req); }
