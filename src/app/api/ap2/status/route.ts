import { NextResponse } from "next/server";
import { enqueueTask } from "@/lib/ap2Queue";

export async function POST(req: Request) {
  const body = await req.json();
  const mode = body.mode;

  if (mode !== "SAFE") {
    return NextResponse.json(
      { error: "Only SAFE mode allowed" },
      { status: 400 }
    );
  }

  const task = await enqueueTask("status.report", {
    requestType: "diagnostic",
    scope: body.scope || [],
    detail: body.detail || "BASIC",
  });

  return NextResponse.json({
    status: "ok",
    worker: "ap2",
    mode,
    taskId: task.id,
    timestamp: new Date().toISOString(),
    vercel: {
      projectId: process.env.AP2_VERCEL_PROJECT_ID || null,
      teamId: process.env.AP2_VERCEL_TEAM_ID || null,
      linkedDomain: "optinodeiq.com",
    },
    github: {
      owner: process.env.AP2_GITHUB_OWNER,
      repo: process.env.AP2_GITHUB_REPO,
      branch: process.env.AP2_GITHUB_BRANCH,
    },
    capabilities: ["write_files", "trigger_vercel_redeploy"],
  });
}
