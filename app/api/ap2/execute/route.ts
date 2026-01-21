import { NextResponse } from "next/server";
import { requireAuth, enqueueAP2 } from "@/app/lib/ap2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This is a thin adapter for the UI console.
// It normalizes payload shapes into AP2 taskType + payload
// and then calls /api/ap2/task/enqueue via enqueueAP2().

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

    const body: any = await req.json().catch(() => ({}));

    // Accept any of these shapes:
    // 1) { taskType, payload }
    // 2) { task: { type, payload } }   (console/chat)
    // 3) { type, payload }            (shorthand)

    const taskType =
      body?.taskType ||
      body?.task?.type ||
      body?.type ||
      body?.task?.taskType ||
      "";

    if (!taskType || typeof taskType !== "string") {
      return NextResponse.json(
        { ok: false, error: "missing_taskType", hint: 'Expected {taskType:"ping", payload:{}} or {task:{type:"ping", payload:{}}}' },
        { status: 400 }
      );
    }

    const payload =
      body?.payload ??
      body?.task?.payload ??
      {};

    const enq = await enqueueAP2(taskType, payload);
    if (!enq.ok) {
      return NextResponse.json(
        { ok: false, error: "enqueue_failed", detail: enq.json },
        { status: enq.status }
      );
    }

    // enqueueAP2 returns { ok:true, json:{ ok:true, task:{...} } } in your build
    return NextResponse.json(enq.json, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "ap2.execute failed" }, { status: 500 });
  }
}
