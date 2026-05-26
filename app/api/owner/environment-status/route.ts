import { NextResponse } from "next/server";

export const runtime = "nodejs";

function has(name: string) {
  return !!String(process.env[name] || "").trim();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    checked_utc: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV || "unknown",
      vercel: has("VERCEL"),
      vercel_env: process.env.VERCEL_ENV || null,
    },
    configured: {
      next_public_site_url: has("NEXT_PUBLIC_SITE_URL"),
      next_public_base_url: has("NEXT_PUBLIC_BASE_URL"),
      ap2_gateway_url: has("AP2_GATEWAY_URL"),
      upstash_redis_rest_url: has("UPSTASH_REDIS_REST_URL") || has("KV_REST_API_URL"),
      upstash_redis_rest_token: has("UPSTASH_REDIS_REST_TOKEN") || has("KV_REST_API_TOKEN"),
      database_url: has("DATABASE_URL"),
      openai_api_key: has("OPENAI_API_KEY"),
    },
    note: "Boolean-only environment visibility. Secret values are never exposed.",
  });
}
