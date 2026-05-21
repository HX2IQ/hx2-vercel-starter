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

    return pkg;
  }

  pkg.expected_guards = [
    "npm run hx2:quick"
  ];

  pkg.files_to_touch = [
    ...(
      pkg.files_to_touch || []
    ),
    "expanded orchestration surface allowed"
  ];

  return pkg;
}
