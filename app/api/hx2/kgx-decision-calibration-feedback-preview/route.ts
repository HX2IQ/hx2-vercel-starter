import { NextResponse } from "next/server";
import { buildKgxDecisionCalibrationFeedback } from "../_lib/kgx-decision-calibration-feedback";

export const dynamic = "force-dynamic";

export async function GET() {
  const feedback =
    await buildKgxDecisionCalibrationFeedback();

  return NextResponse.json({
    ok: true,
    decision_calibration_feedback_active: true,
    feedback
  });
}
