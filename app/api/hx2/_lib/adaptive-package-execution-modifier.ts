export function applyAdaptivePackageExecution(
  sprintPackage: any,
  adaptiveStrategy: any
) {
  const strategy =
    adaptiveStrategy?.strategy || "stability_first";

  const pkg = {
    ...sprintPackage
  };

  if (strategy === "stability_first") {

    pkg.expected_guards = [
      "npm run hx2:quick",
      "npm run hx2:chat-master:guard",
      "Focused guard before patch"
    ];

    pkg.adaptive_modification_audit = {
      strategy,
      modified_fields: ["expected_guards", "files_to_touch"],
      reason: "Stability-first strategy restricts scope and increases guard coverage."
    };

    pkg.files_to_touch = [
      "single isolated file only"
    ];

    return pkg;
  }

  if (strategy === "balanced_execution") {

    pkg.expected_guards = [
      "npm run hx2:quick",
      "npm run hx2:chat-master:guard"
    ];

    pkg.adaptive_modification_audit = {
      strategy,
      modified_fields: ["expected_guards"],
      reason: "Balanced strategy keeps standard verification while allowing modular progress."
    };

    return pkg;
  }

  pkg.expected_guards = [
    "npm run hx2:quick"
  ];

  pkg.adaptive_modification_audit = {
    strategy,
    modified_fields: ["expected_guards", "files_to_touch"],
    reason: "Expansion-ready strategy reduces guard load and allows broader orchestration work."
  };

  pkg.files_to_touch = [
    ...(
      pkg.files_to_touch || []
    ),
    "expanded orchestration surface allowed"
  ];

  return pkg;
}

