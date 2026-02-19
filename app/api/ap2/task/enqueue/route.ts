import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/ap2/tasks";

export const runtime = "nodejs";
const ROUTE_VERSION = "ap2-task-enqueue-v3";

function envDbg() {
  return {
    hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
  };
}

function isAuthed(req: NextRequest) {
  const want = (process.env.HX2_API_KEY || "").trim();
  if (!want) return true;
  const got = req.headers.get("authorization") || "";
  return got === `Bearer ${want}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json(
        { envDbg: envDbg(), ok: false, error: "unauthorized" },
        { status: 401, headers: { "x-ap2-route-version": ROUTE_VERSION } }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const taskType = String(body?.taskType || body?.task || "").trim();
    const payload = body?.payload ?? {};
    const note = body?.note ? String(body.note) : undefined;

    if (!taskType) {
      return NextResponse.json(
        { envDbg: envDbg(), ok: false, error: "missing_taskType", message: "taskType is required" },
        { status: 400, headers: { "x-ap2-route-version": ROUTE_VERSION } }
      );
    }

    const task = await createTask(taskType, payload, note);

    return NextResponse.json(
      { envDbg: envDbg(), ok: true, status: "ENQUEUED", taskId: task.taskId, task },
      { headers: { "x-ap2-route-version": ROUTE_VERSION } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { envDbg: envDbg(), ok: false, error: "enqueue_failed", message: String(e?.message || e) },
      { status: 500, headers: { "x-ap2-route-version": ROUTE_VERSION } }
    );
  }
}