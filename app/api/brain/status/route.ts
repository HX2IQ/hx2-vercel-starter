import { NextResponse } from "next/server";

function pick(obj: any) {
  return {
    installed: !!obj?.installed,
    brain_attached: !!obj?.brain_attached,
    allow_brain_attach: !!obj?.allow_brain_attach,
    ip_firewall: !!obj?.ip_firewall,
    mode: obj?.mode ?? "SAFE",
    timestamp: obj?.timestamp ?? null,
    service: obj?.service ?? "hx2-brain-shell"
  };
}

export async function GET() {
  const base =
    process.env.AP2_GATEWAY_BASE_URL ||
    process.env.HX2_GATEWAY_BASE_URL ||
    process.env.GATEWAY_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { ok: false, error: "Missing gateway base URL env var (AP2_GATEWAY_BASE_URL or HX2_GATEWAY_BASE_URL)" },
      { status: 500 }
    );
  }

  const url = `${base.replace(/\/+$/, "")}/api/brain/status`;

  const res = await fetch(url, {
    method: "GET",
    // IMPORTANT: do not forward auth tokens to brain shell; gateway should auth separately if needed
    headers: { "Accept": "application/json" },
    cache: "no-store"
  });

  const text = await res.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { data = { ok: false, raw: null }; }

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, upstream_status: res.status, upstream: pick(data) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, brain: pick(data) }, { status: 200 });
}
