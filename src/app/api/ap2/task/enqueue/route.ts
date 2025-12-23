import { NextResponse } from "next/server";
import { enqueueTask } from "@/lib/ap2Queue";

export async function POST(req: Request) {
  let body: any = {};

  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const taskType = body.task || body.taskType;
  const mode = body.mode || "SAFE";

  if (!taskType) {
    return NextResponse.json(
      { status: "error", error: "Missing task" },
      { status: 400 }
    );
  }

  if (mode !== "SAFE" && mode !== "safe") {
    return NextResponse.json(
      { status: "error", error: "Only SAFE mode allowed" },
      { status: 400 }
    );
  }

  const task = await enqueueTask(taskType, {});

  return NextResponse.json({
    status: "ok",
    taskId: task.id,
    taskType,
    mode: "SAFE",
  });
}
