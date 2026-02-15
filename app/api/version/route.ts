import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    vercel: {
      env: process.env.VERCEL_ENV || null,
      git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      git_commit_ref: process.env.VERCEL_GIT_COMMIT_REF || null,
      git_repo: process.env.VERCEL_GIT_REPO_SLUG || null,
    },
  });
}