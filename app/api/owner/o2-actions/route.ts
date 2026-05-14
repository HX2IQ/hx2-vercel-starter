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

    const stagingCount = summary?.staging_count ?? 0;
    const incompleteCount = summary?.incomplete_count ?? 0;
    const autopsyCount = summary?.autopsy_count ?? 0;
    const baselineFreshness = summary?.baseline_freshness ?? "unknown";
    const releaseNoteFreshness = summary?.release_note_freshness ?? "unknown";
    const lastPostflightStatus = summary?.last_postflight_status ?? "unknown";

    let state = "green";

    if (stagingCount > 0 || incompleteCount > 0) {
      state = "blocked";
    } else if (
      autopsyCount > 0 ||
      baselineFreshness === "stale" ||
      releaseNoteFreshness === "stale" ||
      lastPostflightStatus === "stale"
    ) {
      state = "degraded";
    }

    const recommendations: string[] = [];
    const cautions: string[] = [];

    if (state === "green") {
      recommendations.push("Run standard postflight when changes are complete.");
      recommendations.push("Capture a fresh baseline after meaningful release changes.");
      recommendations.push("Review O2 status, endpoint health, and baseline drift before new node work.");
      cautions.push("Do not self-patch production without owner review.");
    }

    if (state === "degraded") {
      recommendations.push("Review autopsy, release history, and baseline drift before additional changes.");
      recommendations.push("Prefer smoke tests and owner review over full release actions.");
      if (baselineFreshness === "stale") recommendations.push("Refresh baseline capture.");
      if (releaseNoteFreshness === "stale") recommendations.push("Generate a fresh release note.");
      if (lastPostflightStatus === "stale") recommendations.push("Run a fresh postflight before new release work.");
      cautions.push("Do not run autonomous release actions while degraded.");
    }

    if (state === "blocked") {
      recommendations.push("Clear staging/incomplete artifacts before any further release action.");
      recommendations.push("Run baseline capture and validation only after operator cleanup.");
      recommendations.push("Escalate to owner review before continuing.");
      cautions.push("Do not run postflight.");
      cautions.push("Do not treat the system as release-ready.");
    }

    return NextResponse.json({
      ok: true,
      state,
      allowed: policy?.states?.[state]?.allow || [],
      denied: policy?.states?.[state]?.deny || [],
      recommendations,
      cautions,
      inputs: {
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
