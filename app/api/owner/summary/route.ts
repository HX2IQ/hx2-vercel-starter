import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function getFileAgeMinutes(filePath: string | null) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const ageMs = Date.now() - stat.mtimeMs;
  return Math.floor(ageMs / 60000);
}

function freshnessLabel(minutes: number | null) {
  if (minutes === null) return "unknown";
  if (minutes < 60) return "fresh";
  if (minutes < 360) return "aging";
  return "stale";
}

export async function GET() {
  try {
    const summaryPath = path.join(process.cwd(), "tools", "dashboards", "hx2-owner-summary.json");
    const markerPath = path.join(process.cwd(), "tools", "markers", "last-postflight.json");

    if (!fs.existsSync(summaryPath)) {
      return NextResponse.json(
        { ok: false, error: "Owner summary JSON not found" },
        { status: 404 }
      );
    }

    const raw = fs.readFileSync(summaryPath, "utf8");
    const summary = JSON.parse(raw);

    const latestBaselinePath = summary?.latest_baseline || null;
    const latestReleaseNotePath = summary?.latest_release_note || null;

    let releaseNotePreview = "";
    if (latestReleaseNotePath && fs.existsSync(latestReleaseNotePath)) {
      releaseNotePreview = fs
        .readFileSync(latestReleaseNotePath, "utf8")
        .split(/\r?\n/)
        .slice(0, 20)
        .join("\n");
    }

    const baselineAge = getFileAgeMinutes(latestBaselinePath);
    const releaseAge = getFileAgeMinutes(latestReleaseNotePath);

    let postflightAge: number | null = null;
    let postflightStatus = "unknown";
    let postflightTimestamp: string | null = null;

    if (fs.existsSync(markerPath)) {
      const markerRaw = fs.readFileSync(markerPath, "utf8");
      const markerJson = JSON.parse(markerRaw);

      postflightTimestamp = markerJson?.last_successful_postflight || null;

      if (postflightTimestamp) {
        const ageMs = Date.now() - new Date(postflightTimestamp).getTime();
        postflightAge = Math.floor(ageMs / 60000);
        postflightStatus = freshnessLabel(postflightAge);
      }
    }

    const summaryWithFreshness = {
      ...summary,
      baseline_age_minutes: baselineAge,
      baseline_freshness: freshnessLabel(baselineAge),
      release_note_age_minutes: releaseAge,
      release_note_freshness: freshnessLabel(releaseAge),
      last_postflight_timestamp: postflightTimestamp,
      last_postflight_age_minutes: postflightAge,
      last_postflight_status: postflightStatus,
    };

    return NextResponse.json({
      ok: true,
      summary: summaryWithFreshness,
      release_note_preview: releaseNotePreview,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
