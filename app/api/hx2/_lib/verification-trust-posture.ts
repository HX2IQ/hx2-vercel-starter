export type VerificationTrustPosture = {
  trust_posture: "trusted" | "caution" | "unstable";
  trust_reason: string;
};

export function buildVerificationTrustPosture(
  verification: any,
  sprintPackage: any
): VerificationTrustPosture {
  const status = verification?.verification_status || "warning";
  const action = verification?.suggested_action || "increase_verification";
  const auditApplied = sprintPackage?.recursive_verification_audit?.applied === true;

  if (status === "verified" && action === "proceed") {
    return {
      trust_posture: "trusted",
      trust_reason: "Recursive verification supports normal execution."
    };
  }

  if (auditApplied || action === "increase_verification") {
    return {
      trust_posture: "caution",
      trust_reason: "Recursive verification required stronger controls."
    };
  }

  return {
    trust_posture: "unstable",
    trust_reason: "Verification posture is not fully aligned."
  };
}
