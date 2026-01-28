import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJsonWithTimeout(url: string, init: RequestInit, ms: number) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal, cache: "no-store" as any });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { rawText: text }; }
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse body safely
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    const message = String(body?.message ?? "");
    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
    const HX2 = process.env.HX2_API_KEY;

    // Optional: caller can ask us not to wait at all
    const url = new URL(req.url);
    const waitMs = Number(url.searchParams.get("waitMs") ?? "8000"); // default 8s
    const pollEveryMs = 900;

    if (!HX2) {
      return NextResponse.json({ ok: false, error: "HX2_API_KEY not set on Vercel" }, { status: 500 });
    }

    // 1) Enqueue
    const enq = await fetchJsonWithTimeout(
      `${Base}/api/ap2/task/enqueue`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${HX2}`,
        },
        body: JSON.stringify({
          taskType: "brain.run",
          mode: "SAFE",
          payload: {
            method: "POST",
            path: "/brain/run",
            body: { input: message }
          }
        }),
      },
      10000 // 10s enqueue timeout
    );

    if (!enq.ok) {
      return NextResponse.json(
        { ok: false, error: "AP2 enqueue failed", httpStatus: enq.status, enq: enq.json },
        { status: 502 }
      );
    }

    const taskId = (enq.json as any)?.worker?.task?.id;
    if (!taskId) {
      return NextResponse.json({ ok: false, error: "No taskId returned", enq: enq.json }, { status: 500 });
    }

    // If caller wants fire-and-forget
    if (waitMs <= 0) {
      return NextResponse.json({ ok: true, taskId, pending: true });
    }

    // 2) Poll (short window only)
    const startedAt = Date.now();
    let lastStatus: any = null;

    while (Date.now() - startedAt < waitMs) {
      const st = await fetchJsonWithTimeout(
        `${Base}/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`,
        { headers: { "authorization": `Bearer ${HX2}` } },
        10000 // 10s per status call
      );

      lastStatus = st.json;

      if ((st.json as any)?.state === "DONE") {
        const raw =
          (st.json as any)?.result?.data ??
          (st.json as any)?.result?.data?.data ??
          (st.json as any)?.result?.result ??
          (st.json as any)?.result ??
          null;

        const reply =
          raw?.reply ??
          raw?.output_text ??
          raw?.text ??
          raw?.message ??
          null;

        const ok = raw?.ok !== false;

        return NextResponse.json({ ok, taskId, reply, raw });
      }

      await sleep(pollEveryMs);
    }

    // 3) Fast return if still pending
    return NextResponse.json({
      ok: true,
      taskId,
      pending: true,
      note: "Still running; poll /api/ap2/task/status?taskId=... for completion.",
      lastStatus,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
