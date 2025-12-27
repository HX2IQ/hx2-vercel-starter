import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "ap2.status",
    mode: "SAFE",
    status: "online (local stub)"
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    endpoint: "ap2.status",
    mode: body.mode ?? "SAFE",
    status: "online (local stub)"
  });
}
