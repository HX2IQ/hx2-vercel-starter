import { NextResponse } from "next/server";
import { buildKgxActionPrioritization } from "../_lib/kgx-action-prioritization";

export const dynamic = "force-dynamic";

export async function GET() {
  const prioritization =
    await buildKgxActionPrioritization();

  return NextResponse.json({
    ok: true,
    action_prioritization_active: true,
    prioritization
  });
}
