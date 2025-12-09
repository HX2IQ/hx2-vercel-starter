import { NextResponse } from "next/server";
import { enqueueTask } from "@/lib/ap2Queue";

export async function POST(req: Request) {
  const body = await req.json();

  if (body.mode !== "SAFE") {
    return NextResponse.json(
      { error: "Only SAFE mode allowed" },
      { status: 400 }
    );
  }

  const task = await enqueueTask("status.report", {
    requestType: "deploy",
    meta: {
      projectId: body.projectId || process.env.AP2_VERCEL_PROJECT_ID,
      teamId: body.teamId || process.env.AP2_VERCEL_TEAM_ID,
      comment: body.comment,
    },
  });

  return NextResponse.json({
    status: "ok",
    projectId: process.env.AP2_VERCEL_PROJECT_ID || null,
    teamId: process.env.AP2_VERCEL_TEAM_ID || null,
    taskId: task.id,
    timestamp: new Date().toISOString(),
  });
}
