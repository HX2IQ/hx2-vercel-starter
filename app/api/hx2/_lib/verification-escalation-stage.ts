export function applyVerificationEscalation(
  sprintPackage: any
) {
  const trust =
    sprintPackage?.verification_trust_posture?.trust_posture || "caution";

  const pkg = { ...sprintPackage };

  if (trust === "unstable") {

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Verification escalation review",
        "Manual orchestration review",
        "Single-file stabilization only"
      ])
    );

    pkg.files_to_touch = [
      "single isolated stabilization file only"
    ];

    pkg.verification_escalation = {
      escalated: true,
      escalation_reason:
        "Verification posture became unstable.",
      escalation_action:
        "stabilize_and_verify"
    };

    return pkg;
  }

  if (trust === "caution") {

    pkg.verification_escalation = {
      escalated: false,
      escalation_reason:
        "Verification posture requires caution.",
      escalation_action:
        "increase_verification"
    };

    return pkg;
  }

  pkg.verification_escalation = {
    escalated: false,
    escalation_reason:
      "Verification posture trusted.",
    escalation_action:
      "proceed"
  };

  return pkg;
}
