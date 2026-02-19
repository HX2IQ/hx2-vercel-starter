import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/ap2/tasks";

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

export async function POST(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const taskType = String(body?.taskType ?? body?.task ?? "unknown");
    const payload  = body?.payload ?? {};
    const note     = String(body?.note ?? "");

    const task = await createTask(taskType, payload, note);

    return NextResponse.json({
      ok: true,
      status: "ENQUEUED",
      taskId: task.taskId,
      task
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "enqueue_failed", message: String(e?.message || e) }, { status: 500 });
  }
}