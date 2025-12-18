import { NextRequest, NextResponse } from "next/server";
import { enqueueTask } from "@/lib/ap2Queue";
import { prisma } from "@/lib/prisma";

type HX2Command =
  | "ping"
  | "registry.report"
  | "ap2.install"
  | "ap2.status"
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

  // --------------------------------------------------------
  // Parse JSON safely
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // Main command dispatcher (controller switch)
  // --------------------------------------------------------
  switch (command) {
    // ======================================================
    // V1 COMMANDS — MUST FULLY WORK
    // ======================================================

    case "ping":
      return ok(command, {
        message: "HX2 controller alive",
        source,
        echo: args,
      });

    case "registry.report":
      return ok(command, {
        mode: args.mode ?? "summary",
        nodes: [
          {
            id: "H2",
            label: "Geopolitical / Macro",
            version: "2.1",
            status: "active",
          },
          {
            id: "X2",
            label: "Crypto",
            version: "2.0",
            status: "active",
          },
          {
            id: "K2",
            label: "Marketing",
            version: "2.0",
            status: "active",
          },
          {
            id: "AP2",
            label: "Node builder / automation",
            version: "1.0",
            status: "installed",
          },
        ],
      });

    case "ap2.install":
      return ok(command, {
        installed: true,
        version: "1.0.0",
        message: "AP2 ensured installed and ready.",
      });

    case "ap2.status":
      return ok(command, {
        installed: true,
        version: "1.0.0",
        lastRun: null,
        queueDepth: 0,
        notes: "AP2 online and idle (stub).",
      });

    // ======================================================
    // V2 COMMANDS — STUBS (required for contract stability)
    // ======================================================

    case "ap2.task.enqueue": {
  const { taskType, payload } = body.args || {};

  if (!taskType) {
    return NextResponse.json(
      {
        status: "error",
        error: "Missing taskType",
      },
      { status: 400 }
    );
  }

  const task = await enqueueTask(taskType, payload || {});

  return NextResponse.json({
    status: "ok",
    hx2: true,
    command,
    result: {
      taskId: task.id,
      state: task.state,
    },
    timestamp: new Date().toISOString(),
  });
}


    case "ap2.task.status": {
  const taskId = body.args?.taskId;
  if (!taskId) {
    return NextResponse.json(
      { status: "error", error: "Missing taskId" },
      { status: 400 }
    );
  }

  const task = await prisma.ap2Task.findUnique({
  where: { id: taskId },
});


  if (!task) {
    return NextResponse.json(
      { status: "error", error: "Task not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: "ok",
    hx2: true,
    command,
    result: task,
    timestamp: new Date().toISOString(),
  });
}


    case "ap2.task.list": {
  const tasks = await prisma.ap2Task.findMany({
  where: body.args?.state ? { state: body.args.state } : {},
  orderBy: { createdAt: "desc" },
});

  return NextResponse.json({
    status: "ok",
    hx2: true,
    command,
    result: {
      tasks,
    },
    timestamp: new Date().toISOString(),
  });
}


    case "ap2.scaffold.node":
      return ok(command, {
        taskId: "task_124",
        queued: true,
        nodeId: args.nodeId ?? "H2",
        blueprint: args.blueprint ?? "hx2-node-v1",
      });

    case "registry.node.install":
      return ok(command, {
        nodeId: args.nodeId ?? "H2",
        version: args.version ?? "2.1",
        label: args.label ?? "Geopolitical / Macro",
        status: "installed",
      });

    // ======================================================
    // UNKNOWN COMMAND
    // ======================================================
    default:
      return err(
        command,
        "UNKNOWN_COMMAND",
        `Unsupported command: ${command}`,
        {
          allowed: [
            "ping",
            "registry.report",
            "ap2.install",
            "ap2.status",
            "ap2.task.enqueue",
            "ap2.task.status",
            "ap2.task.list",
            "ap2.scaffold.node",
            "registry.node.install",
          ],
          source,
        }
      );
  }
}
