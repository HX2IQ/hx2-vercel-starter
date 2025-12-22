import { NextRequest, NextResponse } from "next/server";
import { enqueueTask } from "@/lib/ap2Queue";
import { prisma } from "@/lib/prisma";

type HX2Command =
  | "ping"
  | "registry.report"
  | "ap2.install"
  | "ap2.status"
  | "ap2.build.files"
  | "ap2.deploy.vercel"
  | "ap2.task.enqueue"
  | "ap2.task.status"
  | "ap2.task.list"
  | "ap2.scaffold.node"
  | "registry.node.install";

interface HX2RequestBody {
  command?: HX2Command | string;
  source?: string;
  args?: Record<string, any>;
}

function nowIso() {
  return new Date().toISOString();
}

function ok(command: string, result: any) {
  return NextResponse.json({
    status: "ok",
    hx2: true,
    command,
    result,
    timestamp: nowIso(),
  });
}

function err(
  command: string | undefined,
  code: string,
  message: string,
  details: any = {}
) {
  return NextResponse.json(
    {
      status: "error",
      hx2: true,
      command,
      error: { code, message, details },
      timestamp: nowIso(),
    },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  let body: HX2RequestBody = {};

  try {
    body = (await req.json()) as HX2RequestBody;
  } catch {
    body = {};
  }

  const command = body.command ?? "ping";
  const source = body.source ?? "chatgpt";
  const args = body.args ?? {};

  if (typeof command !== "string") {
    return err(undefined, "INVALID_COMMAND", "command must be a string");
  }

  switch (command) {
    /* =========================
       CORE
    ========================== */

    case "ping":
      return ok(command, {
        message: "HX2 controller alive",
        source,
        echo: args,
      });

    case "registry.report":
      return ok(command, {
        nodes: [
          { id: "H2", label: "Geopolitical / Macro", version: "2.1" },
          { id: "X2", label: "Crypto", version: "2.0" },
          { id: "K2", label: "Marketing", version: "2.0" },
          { id: "AP2", label: "Node builder / automation", version: "1.0" },
        ],
      });

    case "ap2.install":
      return ok(command, {
        installed: true,
        version: "1.0.0",
      });

    /* =========================
       REQUIRED REAL MAPPINGS
    ========================== */

    case "ap2.status": {
      const res = await fetch("/api/ap2/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {}),
      });

      const data = await res.json();
      return ok(command, data);
    }

    case "ap2.build.files": {
      const filesRes = await fetch("/api/ap2/files", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args),
      });

      const filesResult = await filesRes.json();

      if (!filesRes.ok) {
        return err(
          command,
          "AP2_FILES_FAILED",
          "File write failed",
          filesResult
        );
      }

      if (args?.operations?.includes("trigger_vercel_redeploy")) {
        const deployRes = await fetch("/api/ap2/vercel/deploy", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            comment: args.comment || "Triggered by HX2",
          }),
        });

        const deployResult = await deployRes.json();

        return ok(command, {
          files: filesResult,
          deploy: deployResult,
        });
      }

      return ok(command, filesResult);
    }

    case "ap2.deploy.vercel": {
      const res = await fetch("/api/ap2/vercel/deploy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {}),
      });

      const data = await res.json();
      return ok(command, data);
    }

    /* =========================
       TASK API (OK TO KEEP)
    ========================== */

    case "ap2.task.enqueue": {
      const { taskType, payload } = args || {};

      if (!taskType) {
        return err(command, "MISSING_TASK_TYPE", "taskType is required");
      }

      const task = await enqueueTask(taskType, payload || {});
      return ok(command, { taskId: task.id, state: task.state });
    }

    case "ap2.task.status": {
      const taskId = args?.taskId;
      if (!taskId) {
        return err(command, "MISSING_TASK_ID", "taskId required");
      }

      const task = await prisma.ap2Task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return err(command, "NOT_FOUND", "Task not found");
      }

      return ok(command, task);
    }

    case "ap2.task.list": {
      const tasks = await prisma.ap2Task.findMany({
        where: args?.state ? { state: args.state } : {},
        orderBy: { createdAt: "desc" },
      });

      return ok(command, { tasks });
    }

    /* =========================
       OPTIONAL / FUTURE
    ========================== */

    case "ap2.scaffold.node":
    case "registry.node.install":
      return err(
        command,
        "NOT_IMPLEMENTED",
        "Command not implemented in v1"
      );

    default:
      return err(command, "UNKNOWN_COMMAND", `Unsupported command: ${command}`);
  }
}
