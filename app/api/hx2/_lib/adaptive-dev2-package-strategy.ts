export type AdaptivePackageStrategy = {
  strategy: string;
  recommendation: string;
};

export function buildAdaptivePackageStrategy(
  successSignal: any
): AdaptivePackageStrategy {
  const score = Number(successSignal?.success_score || 0);

  if (score >= 80) {
    return {
      strategy: "expansion_ready",
      recommendation: "System can safely expand orchestration complexity."
    };
  }

  if (score >= 50) {
    return {
      strategy: "balanced_execution",
      recommendation: "Prefer isolated modular upgrades with guarded preview surfaces."
    };
  }

  return {
    strategy: "stability_first",
    recommendation: "Prefer inspection, isolated patching, and guard hardening before expansion."
  };
}
