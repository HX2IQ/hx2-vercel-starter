export type OrchestrationExecutionContext =
  | "stability_sensitive"
  | "expansion_safe"
  | "verification_heavy"
  | "balanced";

export function classifyOrchestrationExecutionContext(
  sprintPackage: any
): OrchestrationExecutionContext {

  const guards =
    sprintPackage?.expected_guards || [];

  const files =
    sprintPackage?.files_to_touch || [];

  const feature =
    String(
      sprintPackage?.feature_name || ""
    ).toLowerCase();

  if (
    guards.length >= 4 ||
    feature.includes("guard") ||
    feature.includes("verify")
  ) {
    return "verification_heavy";
  }

  if (
    files.length <= 1 ||
    feature.includes("stability")
  ) {
    return "stability_sensitive";
  }

  if (
    files.length >= 4 ||
    feature.includes("expand")
  ) {
    return "expansion_safe";
  }

  return "balanced";
}
