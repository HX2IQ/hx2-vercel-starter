export type BuildOpsSprintPlan = {
  sprint_type: string;
  recommended_focus: string;
  risk_level: string;
  guard_strategy: string;
  execution_notes: string[];
};

export function buildBuildOpsSprintPlan(
  userRequest: string,
  executionMode: string
): BuildOpsSprintPlan {
  const text = userRequest.toLowerCase();

  const isGuardWork =
    /guard|verify|test|contract/i.test(text);

  const isBugfix =
    /fix|debug|error|failed|typescript|syntax/i.test(text);

  const isFeature =
    /add|build|create|wire|integrate|feature/i.test(text);

  if (isBugfix) {
    return {
      sprint_type: "bugfix",
      recommended_focus: "Repair failing contract before feature expansion.",
      risk_level: "medium",
      guard_strategy: "Run targeted guard, then hx2:quick.",
      execution_notes: [
        "Stop on first failing guard.",
        "Prefer minimal patch over broad rewrite.",
        "Do not mutate hot files unless required."
      ]
    };
  }

  if (isGuardWork) {
    return {
      sprint_type: "guard_hardening",
      recommended_focus: "Protect newly added behavior with deterministic checks.",
      risk_level: "low",
      guard_strategy: "Add or update isolated guard, then include it in quick verify if core.",
      execution_notes: [
        "Guard the contract, not incidental formatting.",
        "Keep guard scope file-aware.",
        "Avoid broad string requirements in the wrong file."
      ]
    };
  }

  if (isFeature) {
    return {
      sprint_type: "feature_expansion",
      recommended_focus: "Add isolated capability module before UI integration.",
      risk_level: executionMode === "pipeline" ? "medium" : "low",
      guard_strategy: "Add feature, run hx2:quick, then add guard in next sprint.",
      execution_notes: [
        "One capability per sprint.",
        "Prefer new isolated files.",
        "Expose preview only after backend passes."
      ]
    };
  }

  return {
    sprint_type: "general_buildops",
    recommended_focus: "Clarify build intent through DEV2 planner.",
    risk_level: "low",
    guard_strategy: "Run hx2:quick after changes.",
    execution_notes: [
      "Keep changes small.",
      "Prefer component/module isolation.",
      "Commit only after guards pass."
    ]
  };
}
