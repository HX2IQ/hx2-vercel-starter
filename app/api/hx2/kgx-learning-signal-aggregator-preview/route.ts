import { NextResponse } from "next/server";
import { buildKgxLearningSignalAggregator } from "../_lib/kgx-learning-signal-aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const aggregator =
    await buildKgxLearningSignalAggregator();

  return NextResponse.json({
    ok: true,
    learning_signal_aggregator_active: true,
    aggregator
  });
}
