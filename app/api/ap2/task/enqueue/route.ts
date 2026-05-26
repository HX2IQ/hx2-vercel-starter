import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function j(status: number, obj: any) {
  return new NextResponse(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      "x-chat-route-version": "ap2-enqueue-forward-v2"
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const gateway = (process.env.AP2_GATEWAY_BASE_URL || process.env.AP2_WORKER_BASE_URL || "https://ap2-worker.optinodeiq.com").replace(/\/+$/,"");
    const url = `${gateway}/api/ap2/task/enqueue`;

    // Parse body (tolerant)
    let rawText = await req.text();
    let payload: any = {};
    try { payload = rawText ? JSON.parse(rawText) : {}; } catch { payload = {}; }

    // Normalize: accept task/type -> taskType (and also set type for older worker variants)
    const taskType =
      payload.taskType ??
      payload.type ??
      payload.task ??
      null;

    if (!taskType) {
      return j(400, { ok: false, error: "taskType is required (accepted: taskType | type | task)" });
    }

    const forwardBody = {
      ...payload,
      taskType,
      type: payload.type ?? taskType
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.AP2_BEARER_TOKEN ? { "authorization": `Bearer ${process.env.AP2_BEARER_TOKEN}` } : {})
      },
      body: JSON.stringify(forwardBody)
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json",
        "x-chat-route-version": "ap2-enqueue-forward-v2"
      }
    });
  } catch (e: any) {
    return j(500, { ok: false, error: e?.message || String(e) });
  }
}

export async function GET() {
  return j(405, { ok: false, error: "Method Not Allowed. Use POST.", probe: true });
}
