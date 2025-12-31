import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const task = body?.task ?? { type: "unknown" };
  return NextResponse.json({
    ok: true,
    endpoint: "ap2.task.enqueue",
    queued: true,
    queue_id: `local-${Date.now()}`,
    mode: body?.mode ?? "SAFE",
    received: task,
    executed: { ok: true, mode: body?.mode ?? "SAFE", executed: task?.type ?? "unknown", message: `AP2 executed task: ${task?.type ?? "unknown"}` }
  });
}











