import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const generatedAt = new Date().toISOString();

  const capabilities = [
    {
      id: "web-local-first",
      label: "Web local-first retrieval",
      route: "/api/hx2/web/local-first",
      status: "active",
      exposure: "safe route metadata only",
      notes: "Live results may rotate because public web sources change."
    },
    {
      id: "youtube-local-first",
      label: "YouTube local-first retrieval",
      route: "/api/hx2/youtube/local-first",
      status: "active",
      exposure: "safe route metadata only",
      notes: "Transcript availability depends on source video captions/transcripts."
    },
    {
      id: "retrieval-quality-smoke",
      label: "Retrieval quality smoke",
      script: "tools/retrieval-quality-smoke.ps1",
      status: "active",
      exposure: "safe test harness metadata only",
      notes: "Validates XRP, DTCC, and XLM retrieval quality behavior."
    },
    {
      id: "verify-auto-router",
      label: "Auto verify router",
      script: "tools/hx2-verify-auto.ps1",
      status: "active",
      exposure: "safe verification metadata only",
      notes: "Routes clean, fast, and full verification decisions."
    }
  ];

  const smokeQueries = [
    "latest XRP news",
    "what is DTCC",
    "current XLM DTCC update"
  ];

  const recommendedCommands = [
    "npm run hx2:verify:status",
    "npm run hx2:verify:auto:dry",
    "npm run hx2:verify:auto",
    "npm run hx2:retrieval:status"
  ];

  return NextResponse.json({
    ok: true,
    mode: "read_only_status",
    route: "/api/hx2/retrieval-status",
    ip_firewall: "safe_metadata_only_no_brain_logic",
    generated_at: generatedAt,
    capabilities,
    smoke_queries: smokeQueries,
    recommended_commands: recommendedCommands,
    next_safe_step: "Use this endpoint as the owner-visible retrieval health surface before deeper UI wiring."
  });
}
