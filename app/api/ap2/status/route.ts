import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AP2_GATEWAY_URL = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

export async function POST() {
  try {
    const r = await fetch(`${AP2_GATEWAY_URL}/api/ap2/status`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "accept": "application/json",
      },
    });

    const text = await r.text();

    // Pass-through status + body
    return new NextResponse(text, {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "ap2 gateway unreachable", detail: String(e?.message || e) },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
