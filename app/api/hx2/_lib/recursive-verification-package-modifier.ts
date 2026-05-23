export function applyRecursiveVerificationToPackage(
  sprintPackage: any,
  verification: any
) {
  const pkg = { ...sprintPackage };
  const suggestedAction = verification?.suggested_action || "proceed";

  if (suggestedAction === "increase_verification") {
    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Recursive verification review",
        "Focused guard before patch",
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard"
      ])
    );

    pkg.files_to_touch = ["single isolated file only"];

    pkg.recursive_verification_audit = {
      applied: true,
      suggested_action: suggestedAction,
      verification_status: verification?.verification_status || "warning",
      reason: verification?.reasoning || "Recursive verification required stronger controls."
    };

    return pkg;
  }

  pkg.recursive_verification_audit = {
    applied: false,
    suggested_action: suggestedAction,
    verification_status: verification?.verification_status || "verified",
    reason: verification?.reasoning || "Recursive verification did not require package changes."
  };

  return pkg;
}
