export type KgxOrchestrationRole = {
  role: "primary" | "challenge" | "validation" | "secondary";
  node: string;
  confidence: number;
  reason: string;
};

export function buildKgxOrchestrationAssembly(
  recommendations: { node: string; score: number }[]
) {
  const maxScore =
    recommendations[0]?.score || 1;

  const normalize = (score: number) =>
    Math.round((score / maxScore) * 100) / 100;

  const primary =
    recommendations[0];

  const challenge =
    recommendations.find(x => x.node === "DA2") || {
      node: "DA2",
      score: maxScore * 0.55
    };

  const validation =
    recommendations.find(x => x.node === "QX2") || {
      node: "QX2",
      score: maxScore * 0.5
    };

  const secondary =
    recommendations.find(
      x =>
        x.node !== primary?.node &&
        x.node !== challenge?.node &&
        x.node !== validation?.node &&
        x.node !== "HX2"
    ) ||
    recommendations.find(
      x =>
        x.node !== primary?.node &&
        x.node !== challenge?.node &&
        x.node !== validation?.node
    );

  const roles: KgxOrchestrationRole[] = [];

  if (primary) {
    roles.push({
      role: "primary",
      node: primary.node,
      confidence: normalize(primary.score),
      reason: "highest adaptive recommendation"
    });
  }

  if (challenge) {
    roles.push({
      role: "challenge",
      node: challenge.node,
      confidence: normalize(challenge.score),
      reason: "forced DA2 challenge analysis"
    });
  }

  if (validation) {
    roles.push({
      role: "validation",
      node: validation.node,
      confidence: normalize(validation.score),
      reason: "forced QX2 validation layer"
    });
  }

  if (secondary) {
    roles.push({
      role: "secondary",
      node: secondary.node,
      confidence: normalize(secondary.score),
      reason: "secondary support node"
    });
  }

  return {
    orchestration_assembly_active: true,
    forced_challenge_role_active: true,
    roles,
    primary_node: primary?.node || null,
    challenge_node: challenge?.node || null,
    validation_node: validation?.node || null,
    secondary_node: secondary?.node || null
  };
}
