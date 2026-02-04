import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const claim = String(body?.claim || "").trim();
    const url = String(body?.url || "").trim();
    const context = String(body?.context || "").trim();

    if (!claim && !url) {
      return NextResponse.json(
        { ok: false, node: "factcheck-oi", error: "missing_claim_or_url" },
        { status: 400 }
      );
    }

    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";

    // Pass through auth to AP2 if present (SAFE)
    const auth = req.headers.get("authorization") || "";
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (auth) headers["authorization"] = auth;

    const payload = {
      task: "factcheck.fetch",
      mode: "SAFE",
      claim,
      url,
      context,
      // callbackUrl is already set by your enqueue endpoint,
      // but including it is harmless if your worker ignores it.
      callbackUrl: `${Base}/api/ap2/task/status`
    };

    const enqueueRes = await fetch(`${Base}/api/ap2/task/enqueue`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await enqueueRes.json().catch(() => ({}));

    if (!enqueueRes.ok || !data?.ok) {
      return NextResponse.json(
        { ok: false, node: "factcheck-oi", error: "enqueue_failed", details: data },
        { status: 500 }
      );
    }

    const taskId = data?.worker?.task?.id || data?.taskId || null;

    return NextResponse.json({
      ok: true,
      node: "factcheck-oi",
      mode: "SAFE",
      state: "ENQUEUED",
      taskId,
      message: "Factcheck task enqueued. Poll /api/ap2/task/status?taskId=... for result.",
      ts: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, node: "factcheck-oi", error: e?.message || "unknown_error" },
      { status: 500 }
    );
  }
}
