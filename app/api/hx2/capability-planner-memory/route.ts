import { NextResponse } from "next/server";

import {
  getPlannerMemory
} from "../_lib/capability-memory";

import {
  buildPlannerLearningSignals
} from "../_lib/capability-learning";

export async function GET() {

  const memory =
    getPlannerMemory();

  const escalations =
    memory.filter(
      (m: any) => m.escalation
    ).length;

  const pipelineExecutions =
    memory.filter(
      (m: any) =>
        m.execution_mode === "pipeline"
    ).length;

  const learningSignals =
    buildPlannerLearningSignals();

  return NextResponse.json({
    ok: true,
    memory_count: memory.length,
    escalation_count: escalations,
    pipeline_execution_count: pipelineExecutions,
    learning_signals: learningSignals,
    memory
  });
}

