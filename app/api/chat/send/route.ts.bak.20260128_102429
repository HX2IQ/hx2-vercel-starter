import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
// Avoid caching in edge/CDN layers
export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  try {
    // Parse body safely
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const message = String(body?.message ?? "");
    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
    const HX2 = process.env.HX2_API_KEY;

    if (!HX2) {
      return NextResponse.json(
        { ok: false, error: "HX2_API_KEY not set on Vercel" },
        { status: 500 }
      );
    }

    // Enqueue AP2 task: brain.run -> /brain/run
    const enqueueRes = await fetch(`${Base}/api/ap2/task/enqueue`, {
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
      cache: "no-store",
    });

    let enq: any = null;
    try {
      enq = await enqueueRes.json();
    } catch {
      enq = { ok: false, error: "enqueue returned non-JSON response" };
    }

    if (!enqueueRes.ok) {
      return NextResponse.json(
        { ok: false, error: "AP2 enqueue failed", httpStatus: enqueueRes.status, enq },
        { status: 502 }
      );
    }

    const taskId = enq?.worker?.task?.id;
    if (!taskId) {
      return NextResponse.json(
        { ok: false, error: "No taskId returned", enq },
        { status: 500 }
      );
    }

    // Poll task status
    const startedAt = Date.now();
    let lastStatus: any = null;

    // Poll up to 60s
    while (Date.now() - startedAt < 60000) {
      const stRes = await fetch(
        `${Base}/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`,
        {
          headers: { "authorization": `Bearer ${HX2}` },
          cache: "no-store",
        }
      );

      let st: any = null;
      try {
        st = await stRes.json();
      } catch {
        st = { ok: false, error: "status returned non-JSON response", httpStatus: stRes.status };
      }

      lastStatus = st;

      if (st?.state === "DONE") {
        // Normalize the returned payload from worker
        const data =
          st?.result?.data ??
          st?.result?.data?.data ??
          st?.result?.result ??
          st?.result ??
          null;

        const reply =
          data?.reply ??
          data?.output_text ??
          data?.text ??
          data?.message ??
          null;

        // If the worker reported ok=false, propagate it cleanly
        const ok = data?.ok !== false;

        return NextResponse.json({
          ok,
          taskId,
          reply,
          raw: data,
        });
      }

      // Slight backoff
      await sleep(900);
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Timeout waiting for brain.run",
        taskId,
        lastStatus,
      },
      { status: 504 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
