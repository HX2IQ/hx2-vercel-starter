export type Dev2SprintPackage = {
  feature_name: string;
  category: string;
  files_to_touch: string[];
  risk_gate: string;
  commands: string[];
  expected_guards: string[];
  commit_message: string;
  rollback_note: string;
  execution_phases: {
    phase: string;
    action: string;
  }[];
  copy_ready_powershell: string[];
};

export function buildDev2SprintPackage(
  sprintNext: any
): Dev2SprintPackage {
  const actionable =
    sprintNext?.actionable_sprint || {};

  const buildops =
    sprintNext?.buildops_sprint_plan || {};

  const riskGate =
    sprintNext?.risk_gate || {};

  const powershell =
    sprintNext?.powershell_actions || {};

  const featureName =
    actionable?.dev2_feature_name || "dev2-sprint-package";

  const category =
    actionable?.sprint_category || buildops?.sprint_type || "general_buildops";

  return {
    feature_name: featureName,

    category,

    files_to_touch:
      category === "guard_hardening"
        ? ["tools/**"]
        : category === "bugfix"
        ? ["target file from failing guard", "related guard file"]
        : ["isolated capability file", "optional preview component"],

    risk_gate:
      riskGate?.gate || "unknown",

    commands:
      powershell?.commands || [
        `powershell -ExecutionPolicy Bypass -File .\\tools\\dev2-feature-compiler.ps1 -FeatureName "${featureName}"`,
        "npm run hx2:quick",
        "npm run hx2:chat-master:guard",
        "git status --short"
      ],

    expected_guards: [
      "npm run hx2:quick",
      "npm run hx2:chat-master:guard"
    ],

    commit_message:
      `Complete ${featureName}`,

    rollback_note:
      "Use git restore on touched files if guard fails before commit.",

    execution_phases: [
      {
        phase: "inspect",
        action: "Confirm target files and current guard state before patching."
      },
      {
        phase: "patch",
        action: "Apply one isolated capability change only."
      },
      {
        phase: "verify",
        action: "Run hx2:quick and focused guard commands."
      },
      {
        phase: "commit",
        action: "Commit only after all guards pass."
      }
    ],

    copy_ready_powershell: [
      `powershell -ExecutionPolicy Bypass -File .\\tools\\dev2-feature-compiler.ps1 -FeatureName "${featureName}"`,
      "npm run hx2:quick",
      "npm run hx2:chat-master:guard",
      "git status --short"
    ]
  };
}


