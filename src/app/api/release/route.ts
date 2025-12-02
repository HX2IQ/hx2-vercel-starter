import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    buildId: process.env.VERCEL_BUILD_ID || "local-build",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "dev-commit",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  };

  return NextResponse.json(data);
}
