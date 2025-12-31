import { NextRequest, NextResponse } from "next/server";

/**
 * Canonical HX2 ingress (AP2-first, Prisma-free).
 * Keeps the controller online while DB/schema work catches up.
 */
export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch {}

  const command = body?.command ?? body?.task ?? body?.action ?? null;
  const args = body?.args ?? body ?? {};

  // Helpers
  const ok = (cmd: any, data: any) =>
    NextResponse.json({ ok: true, command: cmd, data });

  const err = (cmd: any, code: string, message: string, extra?: any) =>
    NextResponse.json({ ok: false, command: cmd, error: { code, message, extra } }, { status: 400 });

  if (!command) return err(command, "MISSING_COMMAND", "command is required");

  // AP2-first minimal surface
  switch (command) {
    case "ping":
    case "hx2.ping":
      return ok(command, { pong: true });

    case "ap2.status": {
      const baseUrl = process.env.AP2_WORKER_BASE_URL;
      if (!baseUrl || typeof baseUrl !== "string" || !/^https?:\/\//i.test(baseUrl)) {
        return NextResponse.json(
          {
            ok: false,
            command,
            error: {
              code: "MISSING_AP2_WORKER_BASE_URL",
              message:
                "AP2_WORKER_BASE_URL is not set (or not http/https) in this Vercel project environment.",
            },
          },
          { status: 500 }
        );
      }
const workerBase = process.env.AP2_WORKER_BASE_URL;
      if (!workerBase) return err(command, "MISSING_AP2_WORKER_BASE_URL", "Set AP2_WORKER_BASE_URL");

      const res = await fetch(`${workerBase}/api/ap2/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {}),
      });

      const data = await res.json().catch(() => ({}));
      return ok(command, { workerBase, http: res.status, data });
    }case "ap2.task.enqueue": {
      const taskType = args?.taskType ?? args?.type ?? null;
      if (!taskType) return err(command, "MISSING_TASK_TYPE", "taskType is required");

      // Delegate to lib/ap2Queue stub (already created earlier)
      try {
        const mod = await import("../../../lib/ap2Queue");
        const task = await mod.enqueueTask(taskType, args?.payload ?? {});
        return ok(command, task);
      } catch (e: any) {
        return err(command, "ENQUEUE_FAILED", "enqueueTask failed", String(e?.message ?? e));
      }
    }

    case "ap2.task.status":
      return ok(command, { taskId: args?.taskId ?? null, state: "UNKNOWN", note: "Stubbed until DB model exists" });

    case "ap2.task.list":
      return ok(command, { tasks: [], note: "Stubbed until DB model exists" });

    default:
      return err(command, "NOT_IMPLEMENTED", "Command not implemented in canonical hx2 route yet");
  }
}


