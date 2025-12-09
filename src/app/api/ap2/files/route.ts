import { NextResponse } from "next/server";
import micromatch from "micromatch";
import { enqueueTask } from "@/lib/ap2Queue";

export async function POST(req: Request) {
  const body = await req.json();

  // SAFE mode only
  if (body.mode !== "SAFE") {
    return NextResponse.json(
      { error: "Only SAFE mode is allowed" },
      { status: 400 }
    );
  }

  const allowed = body.constraints?.allowedPaths || [
    "app/**",
    "src/app/**",
    "pages/**",
    "src/pages/**",
  ];

  const denied = body.constraints?.denyPaths || [
    "brain/**",
    "config/brains/**",
    "internal/**",
    "prompts/**",
  ];

  const errors = [];
  const okFiles = [];

  for (const file of body.files || []) {
    const p = file.path;

    if (micromatch.isMatch(p, denied)) {
      errors.push({ path: p, error: "Denied by firewall (denyPaths)" });
      continue;
    }

    if (!micromatch.isMatch(p, allowed)) {
      errors.push({ path: p, error: "Path not allowed (allowedPaths)" });
      continue;
    }

    okFiles.push(file);
  }

  if (errors.length > 0) {
    return NextResponse.json({ status: "error", errors }, { status: 400 });
  }

  // Convert into AP2 worker "edits"
  const edits = okFiles.map((f) => ({
    path: f.path,
    content: f.source,
    message: `AP2: write file ${f.path} (SAFE mode)`,
    encodeBase64: false,
  }));

  // Insert into Prisma queue
  const task = await enqueueTask("code.patch", {
    edits,
    author: {
      name: "AP2 Worker",
      email: "ap2@optinodeiq.com",
    },
  });

  return NextResponse.json({
    status: "ok",
    operation: "write_files",
    taskId: task.id,
    files: okFiles.map((f) => ({
      path: f.path,
      action: "queued",
      branch: process.env.AP2_GITHUB_BRANCH,
    })),
    timestamp: new Date().toISOString(),
  });
}
