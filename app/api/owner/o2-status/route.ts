import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function readJson(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export async function GET() {
  try {
    const summaryPath = path.join(process.cwd(), "tools", "dashboards", "hx2-owner-summary.json");
    const policyPath = path.join(process.cwd(), "tools", "policies", "o2-policy.json");

    const summary = readJson(summaryPath);
    const policy = readJson(policyPath);

    if (!summary || !policy) {
      return NextResponse.json(
        { ok: false, error: "Missing owner summary or O2 policy" },
        { status: 500 }
      );
    }

    const endpointFailures = 0;
    const regressionFailed = false;
    const stagingCount = summary?.staging_count ?? 0;
    const incompleteCount = summary?.incomplete_count ?? 0;
    const autopsyCount = summary?.autopsy_count ?? 0;
    const baselineFreshness = summary?.baseline_freshness ?? "unknown";
    const releaseNoteFreshness = summary?.release_note_freshness ?? "unknown";
    const lastPostflightStatus = summary?.last_postflight_status ?? "unknown";

    let state = "green";

    if (
      endpointFailures > 0 ||
      regressionFailed ||
      stagingCount > 0 ||
      incompleteCount > 0
    ) {
      state = "blocked";
    } else if (
      autopsyCount > 0 ||
      baselineFreshness === "stale" ||
      releaseNoteFreshness === "stale" ||
      lastPostflightStatus === "stale"
    ) {
      state = "degraded";
    }

    return NextResponse.json({
      ok: true,
      state,
      policy: policy.states[state],
      inputs: {
        endpoint_failures: endpointFailures,
        regression_failed: regressionFailed,
        staging_count: stagingCount,
        incomplete_count: incompleteCount,
        autopsy_count: autopsyCount,
        baseline_freshness: baselineFreshness,
        release_note_freshness: releaseNoteFreshness,
        last_postflight_status: lastPostflightStatus
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
