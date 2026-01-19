import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function coerceMessage(body: any): string {
  // Backward compatible: support {message} / {input}
  const direct = body?.message ?? body?.input;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  // New: support Chat-like payload {messages:[{role,content},...]}
  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  const lastUser = [...msgs].reverse().find((m: any) => m?.role === "user" && typeof m?.content === "string" && m.content.trim());
  if (lastUser?.content) return String(lastUser.content).trim();

  return "";
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.HX2_API_KEY || ""}`;

  if (!process.env.HX2_API_KEY || auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  const body = await req.json().catch(() => ({}));

  const message = coerceMessage(body);

  if (!message) {
    return NextResponse.json(
      { ok: false, error: "missing_message", hint: "Send {message:\"...\"} or {messages:[{role:\"user\",content:\"...\"}]}" },
      { status: 400 }
    );
  }

  const res = await fetch(`${origin}/api/brain/run`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: auth,
    },
    body: JSON.stringify({
      method: "POST",
      path: "/brain/chat",
      body: { message, messages: body?.messages }, // pass messages through for future brain support
    }),
  });

  const j = await res.json().catch(() => null);

  // Try a few possible shapes, keep what you already had
  const reply =
    j?.proof?.payload?.result?.data?.reply ??
    j?.proof?.payload?.result?.data?.data?.reply ??
    j?.reply ??
    null;

  return NextResponse.json({ ok: Boolean(reply), reply, raw: j });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
