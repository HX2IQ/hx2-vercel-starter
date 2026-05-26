export type SprintNextAction = {
  dev2_feature_name: string;
  sprint_category: string;
  next_action: string;
  recommended_guard: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "sprint-next";
}

export function buildSprintNextAction(plan: any): SprintNextAction {
  const buildops =
    plan?.buildops_sprint_plan || {};

  const sprintType =
    buildops?.sprint_type || "general_buildops";

  const focus =
    buildops?.recommended_focus ||
    plan?.orchestration_summary ||
    "Continue planner intelligence buildout.";

  return {
    dev2_feature_name:
      slugify(`${sprintType}-${plan?.intent || "planner"}-${plan?.selected_node || "hx2"}`),

    sprint_category:
      sprintType,

    next_action:
      focus,

    recommended_guard:
      buildops?.guard_strategy || "Run hx2:quick after changes."
  };
}
