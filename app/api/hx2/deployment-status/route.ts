import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shortSha(value: string | undefined) {
  if (!value) return "unknown";
  return value.slice(0, 7);
}

export async function GET() {
  const generatedAt = new Date().toISOString();

  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF;
  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;
  const region = process.env.VERCEL_REGION;

  return NextResponse.json({
    ok: true,
    mode: "read_only_deployment_status",
    route: "/api/hx2/deployment-status",
    ip_firewall: "safe_metadata_only_no_brain_logic",
    generated_at: generatedAt,
    deployment: {
      provider: "vercel",
      environment: vercelEnv ?? "unknown",
      branch: commitRef ?? "unknown",
      commit_sha: commitSha ?? "unknown",
      commit_short: shortSha(commitSha),
      commit_message: commitMessage ?? "unknown",
      vercel_url: vercelUrl ?? "unknown",
      region: region ?? "unknown"
    },
    checks: {
      can_compare_live_sha_to_local_head: true,
      exposes_brain_logic: false,
      exposes_runtime_secrets: false
    },
    next_safe_step: "Compare commit_short with local git HEAD when production behavior looks stale."
  });
}
