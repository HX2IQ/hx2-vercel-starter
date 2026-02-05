import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const taskId = String(body?.taskId || "");
  const mode = String(body?.mode || "SAFE");

  if (!taskId) {
    return NextResponse.json({ ok: false, error: "missing_taskId" }, { status: 400 });
  }

  const Base = (process.env.HX2_BASE_URL || "https://optinodeiq.com").replace(/\/+$/, "");
  const Key  = (process.env.HX2_API_KEY || "").trim();

  if (!Key) {
    return NextResponse.json({ ok: false, error: "server_not_configured_missing_HX2_API_KEY" }, { status: 500 });
  }

  const r = await fetch(`${Base}/api/ap2/task/status`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${Key}`,
    },
    body: JSON.stringify({ mode, taskId }),
    cache: "no-store",
  });

  const txt = await r.text();
  let json: any = null;
  try { json = JSON.parse(txt); } catch { json = { rawText: txt }; }

  return NextResponse.json(json, { status: r.status });
}
