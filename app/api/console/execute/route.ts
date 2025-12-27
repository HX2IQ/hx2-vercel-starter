import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload.mode) {
      payload.mode = "SAFE";
    }

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ??
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const r = await fetch(`${base}/api/ap2/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "console.execute failed" },
      { status: 500 }
    );
  }
}
