import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getO2Status(base: string) {
  const res = await fetch(`${base}/api/owner/o2-status`, { cache: "no-store" });
  if (!res.ok) {
    return { ok: false, state: "unknown" };
  }
  return await res.json();
}

export async function GET() {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://optinodeiq.com";

    const o2 = await getO2Status(base);
    const state = o2?.state || "unknown";

    let recommendations: any[] = [];
    let suppressed: string[] = [];

    if (state === "green") {
      recommendations = [
        {
          id: "refresh_owner_summary",
          label: "Run Owner Summary",
          action: "owner_summary",
          rationale: "Refresh owner summary after safe operational changes."
        },
        {
          id: "refresh_drift_dashboard",
          label: "Build Drift Dashboard",
          action: "drift_dashboard",
          rationale: "Rebuild dashboard after new baseline or release work."
        },
        {
          id: "generate_release_note",
          label: "Generate Release Note",
          action: "release_note",
          rationale: "Create updated release documentation after meaningful change."
        },
        {
          id: "run_regression_smoke",
          label: "Run Regression Smoke",
          action: "regression_smoke",
          rationale: "Validate HX2 core behavior before broader release action."
        },
        {
          id: "run_postflight",
          label: "Run Postflight",
          action: "postflight",
          rationale: "Owner-approved full postflight when O2 state is green."
        },
        {
          id: "run_deploy",
          label: "Run Deploy",
          action: "deploy",
          rationale: "Owner-approved deployment after successful postflight."
        }
      ];
    } else if (state === "degraded") {
      recommendations = [
        {
          id: "run_regression_smoke",
          label: "Run Regression Smoke",
          action: "regression_smoke",
          rationale: "Validate current system behavior before any additional work."
        },
        {
          id: "refresh_owner_summary",
          label: "Run Owner Summary",
          action: "owner_summary",
          rationale: "Refresh operational state before manual review."
        },
        {
          id: "refresh_drift_dashboard",
          label: "Build Drift Dashboard",
          action: "drift_dashboard",
          rationale: "Review drift before taking further release actions."
        }
      ];
      suppressed = ["release_note", "postflight", "deploy"];
    } else if (state === "blocked") {
      recommendations = [
        {
          id: "refresh_owner_summary",
          label: "Run Owner Summary",
          action: "owner_summary",
          rationale: "Refresh state for cleanup and escalation review."
        },
        {
          id: "run_regression_smoke",
          label: "Run Regression Smoke",
          action: "regression_smoke",
          rationale: "Only run diagnostics after cleanup steps are understood."
        }
      ];
      suppressed = ["drift_dashboard", "release_note", "postflight", "deploy"];
    }

    return NextResponse.json({
      ok: true,
      state,
      recommendations,
      suppressed
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
