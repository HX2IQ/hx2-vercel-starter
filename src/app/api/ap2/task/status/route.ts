import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      {
        status: "error",
        message: "taskId query parameter is required",
      },
      { status: 400 }
    );
  }

  const task = await prisma.ap2Task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return NextResponse.json(
      {
        status: "error",
        message: "Task not found",
        taskId,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: "ok",
    taskId: task.id,
    state: task.state, // queued | running | completed | failed

    // These are REQUIRED BY CONTRACT, not by schema
    result: {},          // safe placeholder
    error: null,         // safe placeholder

    updatedAt: task.updatedAt.toISOString(),
  });
}
