import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServerAuth(): string | null {
  // Prefer server-side keys; never depend on caller headers for internal calls.
  const key =
    (process.env.AP2_SERVER_KEY ||
      process.env.HX2_SERVER_KEY ||
      process.env.REGISTRY_SERVER_KEY ||
      process.env.HX2_API_KEY ||
      "").trim();

  if (!key) return null;

  // Allow either raw key or already-Bearer formatted env
  return key.toLowerCase().startsWith("bearer ") ? key : `Bearer ${key}`;
}

export async function GET(_req: NextRequest) {
  try {
    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
    const auth = getServerAuth();

    if (!auth) {
      return NextResponse.json(
        { ok: false, error: "Missing server auth env (set HX2_API_KEY or HX2_SERVER_KEY/REGISTRY_SERVER_KEY/AP2_SERVER_KEY)" },
        { status: 500 }
      );
    }

    // Call AP2 enqueue with a tiny SAFE ping to brain shell
    const r = await fetch(`${Base}/api/ap2/task/enqueue`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": auth,
      },
      body: JSON.stringify({
        taskType: "brain.run",
        mode: "SAFE",
        payload: { method: "POST", path: "/brain/status", body: {} },
      }),
      cache: "no-store" as any,
    });

    const j = await r.json().catch(() => null);

    return NextResponse.json(
      {
        ok: true,
        ap2_enqueue_ok: r.ok,
        ap2_http: r.status,
        ap2: j ?? null,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
