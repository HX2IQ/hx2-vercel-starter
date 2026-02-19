import { NextRequest, NextResponse } from "next/server";

import { createTask, getTask } from "@/lib/ap2/tasks";\r
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

    case "env.check": {
      const ap2 = process.env.AP2_WORKER_BASE_URL ?? null;
      return ok(command, {
        AP2_WORKER_BASE_URL: ap2,
        hasAP2: !!ap2,
        note:
          "If AP2_WORKER_BASE_URL is null/empty here, set it in the SAME Vercel project that serves optinodeiq.com.",
      });
    }

    case "ap2.status": {
      const workerBase = process.env.AP2_WORKER_BASE_URL;
      if (!workerBase || typeof workerBase !== "string" || !/^https?:\/\//i.test(workerBase)) {
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

      try {
        const res = await fetch(`${workerBase}/api/ap2/status`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(args || {}),
        });

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(
          { ok: res.ok, command, data: { workerBase, http: res.status, data } },
          { status: res.ok ? 200 : 502 }
        );
      } catch (e: any) {
        return NextResponse.json(
          {
            ok: false,
            command,
            error: {
              code: "AP2_FETCH_FAILED",
              message: "Failed to reach AP2 worker (/api/ap2/status).",
              extra: String(e?.message ?? e),
            },
          },
          { status: 502 }
        );
      }
    }

    case "ap2.task.enqueue": {
      const taskType = args?.taskType ?? args?.type ?? null;
      if (!taskType) return err(command, "MISSING_TASK_TYPE", "taskType is required");

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
