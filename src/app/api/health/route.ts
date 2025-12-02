import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    status: "ok",
    version: "1.0.0",
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    time: new Date().toISOString(),
  };

  return NextResponse.json(data, { status: 200 });
}
