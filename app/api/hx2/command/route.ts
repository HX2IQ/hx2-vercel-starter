import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SAFE passthrough: sends commands to /api/brain/run (no router dependency)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      "https://optinodeiq.com";

    const url = `${base.replace(/\/$/, "")}/api/brain/run`;

    const auth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    // preserve upstream status + body
    return new NextResponse(text, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "internal_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
