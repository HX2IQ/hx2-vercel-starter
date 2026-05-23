export type LearningWeightDrivenStrategy = {
  orchestration_posture:
    | "stability_first"
    | "balanced"
    | "expansion_first";

  verification_intensity:
    | "high"
    | "medium"
    | "low";

  scope_preference:
    | "isolated"
    | "moderate"
    | "expanded";

  strategy_reason: string;
};

export function buildLearningWeightDrivenStrategy(
  weights: any
): LearningWeightDrivenStrategy {

  const stability =
    Number(weights?.stability_bias || 1);

  const expansion =
    Number(weights?.expansion_bias || 1);

  const verification =
    Number(weights?.verification_bias || 1);

  if (
    stability > expansion &&
    verification >= 1.2
  ) {
    return {
      orchestration_posture:
        "stability_first",

      verification_intensity:
        "high",

      scope_preference:
        "isolated",

      strategy_reason:
        "Persistent learning weights favor stability and increased verification."
    };
  }

  if (
    expansion > stability &&
    verification < 1.2
  ) {
    return {
      orchestration_posture:
        "expansion_first",

      verification_intensity:
        "low",

      scope_preference:
        "expanded",

      strategy_reason:
        "Persistent learning weights favor broader orchestration execution."
    };
  }

  return {
    orchestration_posture:
      "balanced",

    verification_intensity:
      "medium",

    scope_preference:
      "moderate",

    strategy_reason:
      "Persistent learning weights currently support balanced orchestration."
  };
}
