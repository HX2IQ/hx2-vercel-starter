import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { Redis } from "@upstash/redis";
import { enqueueAP2 } from "@/app/lib/ap2";

export const runtime = "nodejs";

function runPwsh(scriptPath: string) {
  return new Promise<{ ok: boolean; stdout: string; stderr: string }>((resolve) => {
    execFile(
      "pwsh",
      ["-ExecutionPolicy", "Bypass", "-File", scriptPath],
      { cwd: process.cwd(), timeout: 300000 },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          stdout: stdout || "",
          stderr: stderr || (error ? String(error.message || error) : ""),
        });
      }
    );
  });
}

async function appendHistory(entry: any) {
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

  if (!url || !token) return;

  const redis = new Redis({ url, token });
  const key = "owner:action_history";

  await redis.lpush(key, JSON.stringify(entry));
  await redis.ltrim(key, 0, 49);
}

async function writeRecentCompletion(action: string, ok: boolean, timestamp: string) {
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

  if (!url || !token || !ok) return;

  const redis = new Redis({ url, token });
  await redis.set(`owner:recent_action:${action}`, JSON.stringify({ action, ok, timestamp }));
}

async function writeNodeScaffoldDraft(draft: any) {
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

  if (!url || !token) return;

  const redis = new Redis({ url, token });
  const key = "owner:node_scaffold_drafts";

  await redis.lpush(key, JSON.stringify(draft));
  await redis.ltrim(key, 0, 49);
}

const LOCAL_ONLY = new Set([
  "owner_summary",
  "drift_dashboard",
  "release_note",
  "postflight",
  "deploy",
]);
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action;

    const allowed: Record<string, string> = {
      owner_summary: path.join(process.cwd(), "tools", "hx2-owner-summary.ps1"),
      drift_dashboard: path.join(process.cwd(), "tools", "build-hx2-drift-dashboard.ps1"),
      release_note: path.join(process.cwd(), "tools", "hx2-release-note.ps1"),
      regression_smoke: path.join(process.cwd(), "tools", "hx2-regression-smoke.ps1"),
      brain_connectivity: "remote_ap2_brain_status",
      h2_refresh: "remote_ap2_h2_refresh",
      node_scaffold: "local_draft_scaffold",
      postflight: path.join(process.cwd(), "tools", "hx2-postflight.ps1"),
deploy: path.join(process.cwd(), "tools", "hx2-deploy.ps1"),
    };

    if (!action || !allowed[action]) {
      return NextResponse.json(
        { ok: false, error: "Unsupported owner action" },
        { status: 400 }
      );
    }

    if (action === "regression_smoke") {
      const startedAt = new Date().toISOString();

      const enq = await enqueueAP2("regression.smoke", {
        base: "https://optinodeiq.com",
      });

      const result = {
        ok: !!enq?.ok,
        stdout: "",
        stderr: enq?.ok ? "" : JSON.stringify(enq?.json || {}),
      };

      try {
        await appendHistory({
          timestamp: startedAt,
          action,
          ok: result.ok,
          stdout_tail: "Enqueued remote AP2 regression.smoke task",
          stderr_tail: (result.stderr || "").slice(-500),
        });
        await writeRecentCompletion(action, result.ok, startedAt);
      } catch {}

      return NextResponse.json({
        ok: !!enq?.ok,
        action,
        mode: "remote_ap2",
        enqueue: enq?.json || null,
        stdout: "",
        stderr: result.stderr,
      });
    }

    if (action === "brain_connectivity") {
      const startedAt = new Date().toISOString();

      const enq = await enqueueAP2("brain.status", {});

      const result = {
        ok: !!enq?.ok,
        stdout: "",
        stderr: enq?.ok ? "" : JSON.stringify(enq?.json || {}),
      };

      let historyWriteOk = true;
      let historyWriteError = "";

      try {
        await appendHistory({
          timestamp: startedAt,
          action,
          ok: result.ok,
          stdout_tail: "Enqueued remote AP2 brain.status task",
          stderr_tail: (result.stderr || "").slice(-500),
        });
        await writeRecentCompletion(action, result.ok, startedAt);
      } catch (err: any) {
        historyWriteOk = false;
        historyWriteError = err?.message || String(err);
      }

      return NextResponse.json({
        ok: !!enq?.ok,
        action,
        mode: "remote_ap2",
        enqueue: enq?.json || null,
        stdout: "",
        stderr: result.stderr,
        history_write_ok: historyWriteOk,
        history_write_error: historyWriteError,
      });
    }

    if (action === "h2_refresh") {
      const startedAt = new Date().toISOString();

      const enq = await enqueueAP2("intelligence.recent", {
        node_target: "H2",
        force_refresh: true,
        limit: 10,
      });

      const result = {
        ok: !!enq?.ok,
        stdout: "",
        stderr: enq?.ok ? "" : JSON.stringify(enq?.json || {}),
      };

      let historyWriteOk = true;
      let historyWriteError = "";

      try {
        await appendHistory({
          timestamp: startedAt,
          action,
          ok: result.ok,
          stdout_tail: "Enqueued remote AP2 H2 refresh task",
          stderr_tail: (result.stderr || "").slice(-500),
        });
        await writeRecentCompletion(action, result.ok, startedAt);
      } catch (err: any) {
        historyWriteOk = false;
        historyWriteError = err?.message || String(err);
      }

      return NextResponse.json({
        ok: !!enq?.ok,
        action,
        mode: "remote_ap2",
        enqueue: enq?.json || null,
        stdout: "",
        stderr: result.stderr,
        history_write_ok: historyWriteOk,
        history_write_error: historyWriteError,
      });
    }

    if (action === "node_scaffold") {
      const startedAt = new Date().toISOString();

      const payload = body?.payload || {};
      const scaffold = {
        id: String(payload?.node_id || "test-node"),
        label: String(payload?.node_label || "Test Node"),
        type: String(payload?.node_type || "analysis"),
        status: "draft",
        created_via: "o2",
      };

      try {
        await appendHistory({
          timestamp: startedAt,
          action,
          ok: true,
          stdout_tail: "Generated draft node scaffold",
          stderr_tail: "",
        });
        await writeRecentCompletion(action, true, startedAt);
        await writeNodeScaffoldDraft(scaffold);
      } catch {}

      return NextResponse.json({
        ok: true,
        action,
        scaffold,
        stdout: JSON.stringify(scaffold, null, 2),
        stderr: "",
      });
    }

    if (LOCAL_ONLY.has(action)) {
      return NextResponse.json({
        ok: false,
        action,
        error: "This owner action is local-only and cannot run in Vercel. Run it from your dev machine.",
      });
    }

    const startedAt = new Date().toISOString();
    const result = await runPwsh(allowed[action]);

    try {
      await appendHistory({
        timestamp: startedAt,
        action,
        ok: result.ok,
        stdout_tail: (result.stdout || "").slice(-500),
        stderr_tail: (result.stderr || "").slice(-500),
      });
      await writeRecentCompletion(action, result.ok, startedAt);
    } catch {}

    return NextResponse.json({
      ok: result.ok,
      action,
      stdout: result.stdout.slice(-8000),
      stderr: result.stderr.slice(-4000),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

















