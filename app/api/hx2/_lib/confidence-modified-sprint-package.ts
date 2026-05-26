export function applyConfidenceToSprintPackage(
  sprintPackage: any,
  confidence: any
) {
  const band =
    confidence?.confidence_band || "low";

  const pkg = {
    ...sprintPackage
  };

  if (band === "low") {
    pkg.files_to_touch = [
      "single isolated file only"
    ];

    pkg.expected_guards = Array.from(
      new Set([
        ...(pkg.expected_guards || []),
        "Focused guard before patch",
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard"
      ])
    );

    pkg.confidence_package_audit = {
      confidence_band: band,
      modified_fields: ["files_to_touch", "expected_guards"],
      reason: "Low confidence reduced scope and increased verification."
    };

    return pkg;
  }

  if (band === "high") {
    pkg.files_to_touch = [
      ...(pkg.files_to_touch || []),
      "expanded orchestration surface allowed"
    ];

    pkg.confidence_package_audit = {
      confidence_band: band,
      modified_fields: ["files_to_touch"],
      reason: "High confidence allows broader orchestration work."
    };

    return pkg;
  }

  pkg.confidence_package_audit = {
    confidence_band: band,
    modified_fields: [],
    reason: "Medium confidence kept package unchanged."
  };

  return pkg;
}
