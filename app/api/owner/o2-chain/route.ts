import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

async function getO2Status(base: string) {
  const res = await fetch(`${base}/api/owner/o2-status`, { cache: "no-store" });
  if (!res.ok) return { state: "unknown" };
  return await res.json();
}

async function getRecentAction(action: string) {
  const rawUrl =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    "";
  const rawToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "";

  const url = rawUrl.trim();
  const token = rawToken.trim();

  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const raw = await redis.get(`owner:recent_action:${action}`);
  if (!raw) return null;

  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

async function getChainResetMarker() {
  const rawUrl =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    "";
  const rawToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "";

  const url = rawUrl.trim();
  const token = rawToken.trim();

  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const raw = await redis.get("owner:chain_reset_at");
  if (!raw) return null;

  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

const RECENCY_WINDOWS_MINUTES: Record<string, number> = {
  regression_smoke: 30,
  postflight: 60,
  deploy: 60,
  owner_summary: 15,
};

function isRecent(ts?: string, action?: string, resetAt?: string | null) {
  if (!ts || !action) return false;

  const then = new Date(ts).getTime();
  if (Number.isNaN(then)) return false;

  if (resetAt) {
    const resetMs = new Date(resetAt).getTime();
    if (!Number.isNaN(resetMs) && then < resetMs) {
      return false;
    }
  }

  const minutes = RECENCY_WINDOWS_MINUTES[action] ?? 30;
  const now = Date.now();
  return now - then <= minutes * 60 * 1000;
}

export async function GET() {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://optinodeiq.com";

    const o2 = await getO2Status(base);
    const state = o2?.state || "unknown";

    const recentSmoke = await getRecentAction("regression_smoke");
    const recentPostflight = await getRecentAction("postflight");
    const recentDeploy = await getRecentAction("deploy");
    const recentSummary = await getRecentAction("owner_summary");
    const chainReset = await getChainResetMarker();

    let chain: any[] = [];

    if (state === "green") {
      chain = [
        {
          step: 1,
          action: "regression_smoke",
          label: "Run Regression Smoke",
          status: isRecent(recentSmoke?.timestamp, "regression_smoke", chainReset?.timestamp || null) ? "done_recently" : "ready",
          reason: "Green-state sequence starts with validation before gated release actions.",
          recent_timestamp: recentSmoke?.timestamp || null
        },
        {
          step: 2,
          action: "postflight",
          label: "Run Postflight",
          status: isRecent(recentPostflight?.timestamp, "postflight", chainReset?.timestamp || null) ? "done_recently" : "confirm",
          reason: "Postflight is gated and should follow a successful smoke pass.",
          recent_timestamp: recentPostflight?.timestamp || null
        },
        {
          step: 3,
          action: "deploy",
          label: "Run Deploy",
          status: isRecent(recentDeploy?.timestamp, "deploy", chainReset?.timestamp || null) ? "done_recently" : "confirm",
          reason: "Deploy is gated and should only follow postflight readiness.",
          recent_timestamp: recentDeploy?.timestamp || null
        },
        {
          step: 4,
          action: "owner_summary",
          label: "Refresh Owner Summary",
          status: isRecent(recentSummary?.timestamp, "owner_summary", chainReset?.timestamp || null) ? "done_recently" : "ready",
          reason: "Owner summary closes the loop after operational actions complete.",
          recent_timestamp: recentSummary?.timestamp || null
        }
      ];
    } else if (state === "degraded") {
      chain = [
        {
          step: 1,
          action: "regression_smoke",
          label: "Run Regression Smoke",
          status: isRecent(recentSmoke?.timestamp, "regression_smoke", chainReset?.timestamp || null) ? "done_recently" : "required",
          reason: "Degraded systems should validate current behavior before anything else.",
          recent_timestamp: recentSmoke?.timestamp || null
        },
        {
          step: 2,
          action: "owner_summary",
          label: "Refresh Owner Summary",
          status: isRecent(recentSummary?.timestamp, "owner_summary", chainReset?.timestamp || null) ? "done_recently" : "review",
          reason: "Owner summary helps assess degraded-state recovery posture.",
          recent_timestamp: recentSummary?.timestamp || null
        }
      ];
    } else if (state === "blocked") {
      chain = [
        {
          step: 1,
          action: "owner_summary",
          label: "Run Owner Summary",
          status: isRecent(recentSummary?.timestamp, "owner_summary", chainReset?.timestamp || null) ? "done_recently" : "required",
          reason: "Blocked systems need current state visibility first.",
          recent_timestamp: recentSummary?.timestamp || null
        },
        {
          step: 2,
          action: "regression_smoke",
          label: "Run Diagnostics",
          status: isRecent(recentSmoke?.timestamp, "regression_smoke", chainReset?.timestamp || null) ? "done_recently" : "required",
          reason: "Diagnostics are used only to understand blocked-state failure conditions.",
          recent_timestamp: recentSmoke?.timestamp || null
        }
      ];
    }

    return NextResponse.json({
      ok: true,
      state,
      chain,
      chain_reset_at: chainReset?.timestamp || null,
      cycle_started_at: chainReset?.timestamp || null,
      recent: {
        regression_smoke: recentSmoke,
        postflight: recentPostflight,
        deploy: recentDeploy,
        owner_summary: recentSummary
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}




