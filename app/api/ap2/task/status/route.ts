import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId") || "";

  if (!taskId) {
    return NextResponse.json(
      { status: "error", error: "missing_taskId", message: "Provide taskId as query param." },
      { status: 400 }
    );
  }

  // SAFE fallback: return a valid JSON envelope even if you haven't wired a task store yet.
  // This prevents 404s and unblocks console polling immediately.
  return NextResponse.json({
    status: "ok",
    taskId,
    state: "unknown",
    result: null,
    error: null,
    note: "Status endpoint installed. Wire real task store later if needed."
  });
}











