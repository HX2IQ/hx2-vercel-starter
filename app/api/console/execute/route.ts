import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload.mode) payload.mode = "SAFE";

  const r = await fetch(${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/ap2/task/enqueue, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: Bearer 
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
