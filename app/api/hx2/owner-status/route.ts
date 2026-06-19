import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const generatedAt = new Date().toISOString();

  const surfaces = [
    {
      id: "verify-status-dashboard",
      label: "Verify Status Dashboard",
      command: "npm run hx2:verify:status",
      status: "active",
      purpose: "Shows Git state, auto verify decision, latest log, and verify commands."
    },
    {
      id: "auto-verify-router",
      label: "Auto Verify Router",
      command: "npm run hx2:verify:auto",
      dry_run_command: "npm run hx2:verify:auto:dry",
      status: "active",
      purpose: "Chooses no verify, FAST verify, or FULL verify based on changed files."
    },
    {
      id: "retrieval-status",
      label: "Retrieval Status Surface",
      endpoint: "/api/hx2/retrieval-status",
      command: "npm run hx2:retrieval:status",
      status: "active",
      purpose: "Read-only retrieval health metadata without brain logic exposure."
    },
    {
      id: "retrieval-quality-smoke",
      label: "Retrieval Quality Smoke",
      command: "npm run hx2:quick:compact",
      status: "active",
      purpose: "Validates current retrieval quality behavior for XRP, DTCC, and XLM."
    }
  ];

  const readiness = {
    verification_layer: "active",
    retrieval_layer: "active",
    owner_visibility_layer: "active",
    deployment_probe_ready: true,
    ip_firewall: "safe_metadata_only_no_brain_logic"
  };

  const next_commands = [
    {
      label: "Owner dashboard",
      command: "npm run hx2:owner:status"
    },
    {
      label: "Verify dashboard",
      command: "npm run hx2:verify:status"
    },
    {
      label: "Decision only",
      command: "npm run hx2:verify:auto:dry"
    },
    {
      label: "Auto verify",
      command: "npm run hx2:verify:auto"
    },
    {
      label: "Retrieval status",
      command: "npm run hx2:retrieval:status"
    }
  ];

  return NextResponse.json({
    ok: true,
    mode: "read_only_owner_status",
    route: "/api/hx2/owner-status",
    generated_at: generatedAt,
    readiness,
    surfaces,
    next_commands,
    next_safe_step: "Use this as the owner-facing status index before wiring UI cards or broader operations dashboards."
  });
}
