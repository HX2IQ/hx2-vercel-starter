import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    worker: "ap2",
    message: "AP2 infra worker online",
    scopes: ["vercel", "frontend", "next_api"],
    constraints: {
      brainAccess: false,
      denyPaths: ["brain/**", "config/brains/**", "internal/**", "prompts/**"],
    },
    timestamp: new Date().toISOString(),
  });
}
