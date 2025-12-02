import { NextRequest, NextResponse } from "next/server";

const AUTH = process.env.HX2_API_KEY || "";

function requireAuth(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  if (!AUTH) return null;
  if (h === `Bearer ${AUTH}`) return null;
  return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" }});
}

export async function POST(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const blueprint = body.blueprint_name || body.blueprint || "unnamed";
  const dryRun = !!body.dryRun;
  const deploy = !!body.deploy;

  const generated = {
    name: blueprint,
    files: [
      { path: `nodes/${blueprint}/page.tsx`, contents: "export default function Page(){ return 'Hello HX2' }" }
    ],
    estimatedBuildTime: "2s",
    dryRun
  };

  const deployResult = deploy ? { merged: true, commitId: `commit_${Math.random().toString(36).slice(2,9)}` } : null;

  return NextResponse.json({
    status: "ok",
    generated,
    message: dryRun ? "Dry run only — no deployment triggered" : (deploy ? "Simulated deploy executed" : "Scaffold generated"),
    deploy: deployResult
  });
}
