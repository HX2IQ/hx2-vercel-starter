import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.HX2_API_KEY || ""}`;

  if (!process.env.HX2_API_KEY || auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? body.input ?? "");

  const res = await fetch(`${origin}/api/brain/run`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: auth,
    },
    body: JSON.stringify({
      method: "POST",
      path: "/brain/chat",
      body: { message },
    }),
  });

  const j = await res.json().catch(() => null);
  const reply =
    j?.proof?.payload?.result?.data?.reply ??
    j?.proof?.payload?.result?.data?.data?.reply ??
    null;

  return NextResponse.json({ ok: Boolean(reply), reply, raw: j });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
