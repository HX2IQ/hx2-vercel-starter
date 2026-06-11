import { NextResponse } from "next/server";
import { buildKgxStrategicGoalIntelligence } from "../_lib/kgx-strategic-goal-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const goals =
    await buildKgxStrategicGoalIntelligence();

  return NextResponse.json({
    ok: true,
    strategic_goal_intelligence_active: true,
    goals
  });
}
