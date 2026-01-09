import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const worker = process.env.AP2_WORKER_URL || "https://ap2-worker.optinodeiq.com";
  const key = process.env.HX2_API_KEY || "";

  if (!key) {
    return NextResponse.json(
      { ok: false, status: 500, error: "HX2_API_KEY missing on server" },
      { status: 500 }
    );
  }

  const body = await req.text();

  const url = worker.replace(/\/+$/, "") + "/api/ap2/task/enqueue";

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + key,
    },
    body,
    cache: "no-store",
  });

  const text = await r.text();

  try {
    return NextResponse.json(JSON.parse(text), { status: r.status });
  } catch {
    return NextResponse.json({ ok: false, status: r.status, raw: text }, { status: r.status });
  }
}
