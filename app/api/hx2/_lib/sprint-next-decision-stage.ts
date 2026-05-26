import { buildDev2OperatorDecision } from "./dev2-operator-decision";
import { applyTelemetryInfluenceToOperatorDecision } from "./telemetry-influenced-operator-decision";
import { applyConfidenceToOperatorDecision } from "./confidence-influenced-operator-decision";
import { applyVerificationEscalationToOperatorDecision } from "./verification-escalation-operator-decision";
import { applyConfidenceDecayToOperatorDecision } from "./confidence-decay-operator-decision";

export function buildSprintNextDecisionStage(input: {
  sprintPackage: any;
  outcomeTelemetryInfluence: any;
  orchestrationConfidence: any;
}) {
  const baseDecision =
    buildDev2OperatorDecision(input.sprintPackage);

  const telemetryDecision =
    applyTelemetryInfluenceToOperatorDecision(
      baseDecision,
      input.outcomeTelemetryInfluence
    );

  const confidenceDecision =
    applyConfidenceToOperatorDecision(
      telemetryDecision,
      input.orchestrationConfidence
    );

  const escalationDecision =
    applyVerificationEscalationToOperatorDecision(
      confidenceDecision,
      input.sprintPackage
    );

  const confidenceDecayDecision =
    applyConfidenceDecayToOperatorDecision(
      escalationDecision,
      input.sprintPackage
    );

  return confidenceDecayDecision;
}
