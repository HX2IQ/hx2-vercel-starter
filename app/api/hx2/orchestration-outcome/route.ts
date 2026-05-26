import { buildOperatorFollowthroughEvaluation } from "../_lib/operator-followthrough-evaluator";
import { buildOrchestrationOutcomeLearningRecord } from "../_lib/orchestration-outcome-learning-record";
import { updateAdaptiveLearningWeights } from "../_lib/adaptive-learning-weight-updater";
import { persistOrchestrationOutcomeLearningRecord } from "../_lib/orchestration-outcome-persistence";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const execution_id =
      body?.execution_id || "unknown";

    const runtime_status =
      body?.runtime_status || "pending";

    const completed_guards =
      Array.isArray(body?.completed_guards)
        ? body.completed_guards
        : [];

    const runtimeOutcome = {
      execution_id,
      runtime_status,
      completed_guards,
      completion_timestamp:
        new Date().toISOString()
    };

    const followthroughEvaluation =
      buildOperatorFollowthroughEvaluation(
        body?.execution_memory || {},
        runtimeOutcome
      );

    const learningRecord =
      buildOrchestrationOutcomeLearningRecord(
        runtimeOutcome,
        followthroughEvaluation
      );

    const persistence =
      persistOrchestrationOutcomeLearningRecord(
        learningRecord
      );

    const updated_learning_weights =
      updateAdaptiveLearningWeights(
        learningRecord
      );

    return NextResponse.json({
      ok: true,
      recorded_outcome:
        runtimeOutcome,

      followthrough_evaluation:
        followthroughEvaluation,

      learning_record:
        learningRecord,

      persistence,

      updated_learning_weights
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "orchestration outcome record failure"
    });
  }
}




