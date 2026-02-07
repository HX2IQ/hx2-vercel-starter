import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const taskId = body?.taskId || body?.task_id || body?.id || null;

  if (!taskId) {
    return NextResponse.json({ ok:false, error:"missing_task_id" }, { status:400 });
  }

  const base = (process.env.HX2_BASE_URL || "https://optinodeiq.com").replace(/\/+$/, "");
  const apiKey = (process.env.HX2_API_KEY || "").trim();

  if (!apiKey) {
    return NextResponse.json({ ok:false, error:"server_not_configured_missing_HX2_API_KEY" }, { status:500 });
  }

  const res = await fetch(`${base}/api/ap2/task/status`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ mode:"SAFE", taskId }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json({ ok:true, status: json, ts: new Date().toISOString() }, { status:200 });
}
