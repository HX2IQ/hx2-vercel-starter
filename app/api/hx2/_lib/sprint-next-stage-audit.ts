export function buildSprintNextStageAudit() {
  return {
    stage_model: "ordered_stage_helpers",
    stages: [
      "plan",
      "learning",
      "telemetry",
      "risk",
      "package",
      "context",
      "adaptation",
      "decision",
      "memory"
    ],
    guard_reason:
      "Sprint Next composition is organized as explicit ordered stages to prevent used-before-declaration errors."
  };
}
