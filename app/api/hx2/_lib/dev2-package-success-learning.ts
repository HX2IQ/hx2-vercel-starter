export type Dev2PackageSuccessSignal = {
  package_type: string;
  success_score: number;
};

function normalizeCategory(
  category: string
) {
  return (
    category ||
    "general_buildops"
  ).toLowerCase();
}

export function buildDev2PackageSuccessSignal(
  sprintPackage: any,
  learningSignals: any
): Dev2PackageSuccessSignal {

  const category =
    normalizeCategory(
      sprintPackage?.category
    );

  const plannerFeedback =
    learningSignals?.planner_feedback_frequency || {};

  const successRate =
    Number(
      plannerFeedback?.execution_success || 0
    );

  const quality =
    Number(
      plannerFeedback?.quality_score || 0
    );

  const score =
    Number(
      (
        (successRate * 0.7) +
        (quality * 0.3)
      ).toFixed(2)
    );

  return {
    package_type:
      category,

    success_score:
      score
  };
}
