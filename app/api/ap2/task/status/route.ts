import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId") || "";

  if (!taskId) {
    return NextResponse.json(
      { ok: false, status: 400, error: "missing_taskId", message: "Provide taskId as query param." },
      { status: 400 }
    );
  }

  const worker = process.env.AP2_WORKER_URL || "https://ap2-worker.optinodeiq.com";
  const serverKey = process.env.HX2_API_KEY || "";

  // Prefer the caller's auth header (so Vercel env mismatch can't break this)
  const callerAuth = req.headers.get("authorization") || "";
  const auth = callerAuth || (serverKey ? ("Bearer " + serverKey) : "");

  if (!auth) {
    return NextResponse.json(
      { ok: false, status: 401, error: "missing_auth", message: "Missing Authorization header and HX2_API_KEY not set on server." },
      { status: 401 }
    );
  }

  const upstreamUrl = worker.replace(/\/+$/, "") + "/api/ap2/task/status";

  const r = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": auth,
    },
    body: JSON.stringify({ taskId }),
    cache: "no-store",
  });

  const text = await r.text();

  try {
    return NextResponse.json(JSON.parse(text), { status: r.status });
  } catch {
    return NextResponse.json({ ok: r.ok, status: r.status, raw: text }, { status: r.status });
  }
}
