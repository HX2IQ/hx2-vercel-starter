import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedis() {
  const url = String(
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).trim();

  const token = String(
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();

  if (!url || !token) return null;
  return new Redis({ url, token });
}

function summarize(taskType: string, state: string, result: any) {
  if (taskType === "regression.smoke") {
    const hardFailureCount = Number(result?.hard_failure_count ?? result?.fail_count ?? 0);
    const ok = state === "COMPLETED" && hardFailureCount === 0;

    return {
      action: "regression_smoke",
      ok,
      stdout_tail: ok
        ? `Regression smoke passed`
        : `Regression smoke failed`,
      stderr_tail: ok ? "" : `hard_failure_count=${hardFailureCount}`,
    };
  }

  if (taskType === "brain.status") {
    const httpStatus = Number(result?.httpStatus ?? 0);
    const ok = state === "COMPLETED" && result?.ok === true && httpStatus === 200;

    return {
      action: "brain_connectivity",
      ok,
      stdout_tail: `Brain status http ${httpStatus || "unknown"}`,
      stderr_tail: ok ? "" : JSON.stringify(result || {}).slice(0, 500),
    };
  }

  if (taskType === "intelligence.recent") {
    const ok = state === "COMPLETED" && result?.ok === true;

    return {
      action: "h2_refresh",
      ok,
      stdout_tail: ok ? "H2 refresh completed" : "H2 refresh failed",
      stderr_tail: ok ? "" : JSON.stringify(result || {}).slice(0, 500),
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const taskId = String(body?.taskId || "");
    const taskType = String(body?.taskType || "");
    const state = String(body?.state || "");
    const result = body?.result ?? null;

    if (!taskId || !taskType || !state) {
      return NextResponse.json(
        { ok: false, error: "Missing taskId/taskType/state" },
        { status: 400 }
      );
    }

    const summary = summarize(taskType, state, result);
    if (!summary) {
      return NextResponse.json({ ok: true, persisted: false, ignored: true });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ ok: true, persisted: false, skipped: "redis_unavailable" });
    }

    const entry = {
      timestamp: new Date().toISOString(),
      task_id: taskId,
      task_type: taskType,
      task_state: state,
      action: summary.action,
      ok: summary.ok,
      stdout_tail: summary.stdout_tail,
      stderr_tail: summary.stderr_tail,
    };

    await redis.lpush("owner:action_history", JSON.stringify(entry));
    await redis.ltrim("owner:action_history", 0, 49);

    return NextResponse.json({ ok: true, persisted: true, entry });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

