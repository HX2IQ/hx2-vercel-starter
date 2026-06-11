import { NextResponse } from "next/server";
import { buildKgxActionDependencyIntelligence } from "../_lib/kgx-action-dependency-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const dependencies =
    await buildKgxActionDependencyIntelligence();

  return NextResponse.json({
    ok: true,
    action_dependency_intelligence_active: true,
    dependencies
  });
}
