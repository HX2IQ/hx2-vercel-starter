export function applyTelemetryInfluenceToOperatorDecision(
  operatorDecision: any,
  telemetryInfluence: any
) {
  const posture =
    telemetryInfluence?.telemetry_posture || "neutral";

  const updated = {
    ...operatorDecision
  };

  if (posture === "negative") {
    updated.decision = "stabilize";

    updated.reason =
      "Outcome telemetry detected orchestration instability.";

    updated.operator_message =
      "Reduce orchestration scope and increase verification discipline until telemetry improves.";

    updated.telemetry_override = true;

    return updated;
  }

  if (posture === "positive") {
    if (updated.decision === "proceed") {
      updated.decision = "expand";

      updated.reason =
        "Positive orchestration telemetry supports broader execution.";

      updated.operator_message =
        "Telemetry supports expanded orchestration confidence.";

      updated.telemetry_override = true;
    }
  }

  updated.telemetry_override = false;

  return updated;
}
