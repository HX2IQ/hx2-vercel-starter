import { NextResponse } from "next/server";
import { getRedis } from "@lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = getRedis();

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Keep phone validation intentionally light (avoid blocking real users)
function normalizePhone(s: string) {
  const digits = (s || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  // store as digits only; allow 7-15 digits
  if (digits.length < 7 || digits.length > 15) return "";
  return digits;
}

export async function POST(req: Request) {
  if (!redis) return bad(500, "redis_not_configured");

  try {
    const body: any = await req.json().catch(() => ({}));

    const name = String(body?.name || "").trim().slice(0, 120);
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = normalizePhone(String(body?.phone || ""));
    const interest = String(body?.interest || "").trim().slice(0, 200);
    const source = String(body?.source || "").trim().slice(0, 120); // e.g. optinodeoi.com, optinodeiq.com, QR code, ad campaign
    const note = String(body?.note || "").trim().slice(0, 500);

    if (!email || !isValidEmail(email)) return bad(400, "invalid_email");
    if (!name && !phone && !interest) return bad(400, "insufficient_fields", { required: "email + one of name/phone/interest" });

    const ts = new Date().toISOString();
    const id = (globalThis.crypto as any)?.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const record = {
      id,
      ts,
      name: name || null,
      email,
      phone: phone || null,
      interest: interest || null,
      source: source || null,
      note: note || null
    };

    // Store by id, and index by email for de-dupe (idempotent-ish)
    await redis.set(`hx2:retail:lead:${id}`, JSON.stringify(record));
    await redis.raw(`/sadd/${encodeURIComponent("hx2:retail:leads:set")}/${encodeURIComponent(id)}`);await redis.set(`hx2:retail:leads:byEmail:${email}`, id);

    return NextResponse.json({ ok: true, stored: true, id, ts });
  } catch (e: any) {
    return bad(500, "internal_error", { message: String(e?.message || e) });
  }
}

export async function GET() {
  if (!redis) return bad(500, "redis_not_configured");

  try {
    // Safe public metric: total leads (no PII returned)
    const r = await redis.raw(`/scard/${encodeURIComponent("hx2:retail:leads:set")}`);
const count = r?.json?.result ?? 0;
    return NextResponse.json({ ok: true, count: Number(count || 0), ts: new Date().toISOString() });
  } catch (e: any) {
    return bad(500, "internal_error", { message: String(e?.message || e) });
  }
}


