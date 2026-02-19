import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/ap2/tasks";

export const runtime = "nodejs";
const ROUTE_VERSION = "ap2-task-status-v3";

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

export async function GET(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json(
        { envDbg: envDbg(), ok: false, error: "unauthorized" },
        { status: 401, headers: { "x-ap2-route-version": ROUTE_VERSION } }
      );
    }

    const url = new URL(req.url);
    const taskId = String(url.searchParams.get("taskId") || url.searchParams.get("id") || "").trim();

    if (!taskId) {
      return NextResponse.json(
        { envDbg: envDbg(), ok: false, error: "missing_taskId", message: "Provide taskId." },
        { status: 400, headers: { "x-ap2-route-version": ROUTE_VERSION } }
      );
    }

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json(
        { envDbg: envDbg(), ok: false, error: "TASK_NOT_FOUND", taskId },
        { status: 404, headers: { "x-ap2-route-version": ROUTE_VERSION } }
      );
    }

    return NextResponse.json(
      { envDbg: envDbg(), ok: true, taskId, state: task.state ?? "UNKNOWN", task },
      { headers: { "x-ap2-route-version": ROUTE_VERSION } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { envDbg: envDbg(), ok: false, error: "status_failed", message: String(e?.message || e) },
      { status: 500, headers: { "x-ap2-route-version": ROUTE_VERSION } }
    );
  }
}