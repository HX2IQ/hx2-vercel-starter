import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { branch, message, plan, policy } = body;

    if (!branch || !message) {
      return NextResponse.json({ error: "Missing branch or message" }, { status: 400 });
    }

    return NextResponse.json({
      status: "ok",
      action: "deploy",
      branch,
      message,
      merged: policy?.autoMerge ?? false,
      risk: policy?.risk ?? "low",
      commitId: `commit_${Math.random().toString(36).slice(2, 10)}`,
      durationMs: Math.floor(Math.random() * 2000) + 500,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
