import { NextRequest, NextResponse } from "next/server";

import { getTask } from "@/lib/ap2/tasks";

const envDbg = {
  hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
  hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
};


export const runtime = "nodejs";

function isAuthed(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  const token = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
  const ok = !!token && (
    token === (process.env.HX2_API_KEY || "") ||
    token === (process.env.AP2_API_KEY || "")
  );
  return ok;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ envDbg: envDbg, ok: false, error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const taskId = String(url.searchParams.get("taskId") || url.searchParams.get("id") || "");

    if (!taskId) {
      return NextResponse.json({ envDbg: envDbg, ok: false, error: "missing_taskId", message: "Provide taskId." }, { status: 400 });
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ envDbg: envDbg, ok: false, error: "TASK_NOT_FOUND", taskId }, { status: 404 });
    }

    return NextResponse.json({ envDbg: envDbg, ok: true,  taskId, state: task.state ?? "UNKNOWN", task });
  } catch (e: any) {
    return NextResponse.json({ envDbg: envDbg, ok: false, error: "status_failed", message: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ envDbg: envDbg, ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const taskId = String(body?.taskId ?? body?.id ?? "");

    if (!taskId) {
      return NextResponse.json({ envDbg: envDbg, ok: false, error: "missing_taskId", message: "Provide taskId." }, { status: 400 });
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ envDbg: envDbg, ok: false, error: "TASK_NOT_FOUND", taskId }, { status: 404 });
    }

    return NextResponse.json({ envDbg: envDbg, ok: true,  taskId, state: task.state ?? "UNKNOWN", task });
  } catch (e: any) {
    return NextResponse.json({ envDbg: envDbg, ok: false, error: "status_failed", message: String(e?.message || e) }, { status: 500 });
  }
}