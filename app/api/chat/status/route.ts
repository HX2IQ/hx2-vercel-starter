import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
    const HX2  = req.headers.get("authorization") || "";

    // Call AP2 enqueue with a tiny SAFE ping to brain shell
    const r = await fetch(`${Base}/api/ap2/task/enqueue`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": HX2
      },
      body: JSON.stringify({
        taskType: "brain.run",
        mode: "SAFE",
        payload: { method: "POST", path: "/brain/status", body: {} }
      })
    });

    const j = await r.json().catch(() => null);

    return NextResponse.json({
      ok: true,
      ap2_enqueue_ok: r.ok,
      ap2_http: r.status,
      ap2: j ?? null,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

