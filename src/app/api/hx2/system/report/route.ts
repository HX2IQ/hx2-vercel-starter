import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: getEnvStatus(),
    timestamp: new Date().toISOString()
  });
}

function getEnvStatus() {
  return {
    HX2_API_KEY: process.env.HX2_API_KEY ? "SET" : "MISSING",
    HX2_PROXY_URL: process.env.HX2_PROXY_URL ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV || "unknown",
    VERCEL_ENV: process.env.VERCEL_ENV || "unknown",
  };
}
