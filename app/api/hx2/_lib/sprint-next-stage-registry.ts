export type SprintNextStageDefinition = {
  id: string;
  description: string;
  stage_type:
    | "planning"
    | "verification"
    | "synthesis"
    | "restraint"
    | "decision";

  helper: string;
};

export const sprintNextStageRegistry: SprintNextStageDefinition[] = [
  {
    id: "learning-telemetry",
    description: "Telemetry and orchestration learning stage",
    stage_type: "planning",
    helper: "buildSprintNextLearningTelemetryStage"
  },
  {
    id: "recursive-verification",
    description: "Recursive orchestration verification",
    stage_type: "verification",
    helper: "applyRecursiveVerificationToPackage"
  },
  {
    id: "verification-escalation",
    description: "Verification escalation orchestration",
    stage_type: "verification",
    helper: "applyVerificationEscalation"
  },
  {
    id: "verification-synthesis",
    description: "Cross-stage orchestration synthesis",
    stage_type: "synthesis",
    helper: "buildVerificationSynthesis"
  },
  {
    id: "adaptive-restraint",
    description: "Adaptive orchestration restraint",
    stage_type: "restraint",
    helper: "applyAdaptiveRestraintToPackage"
  },
  {
    id: "decision-stage",
    description: "Final orchestration operator decision chain",
    stage_type: "decision",
    helper: "buildSprintNextDecisionStage"
  }
];
