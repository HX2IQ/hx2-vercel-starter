import { prisma } from "./kgx-lite";

export async function buildKgxPlannerInfluence(
  userRequest: string
) {
  const relationships =
    await prisma.kgxRelationship.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });

  const nodeScores: Record<string, number> = {};

  for (const relationship of relationships) {
    const source =
      relationship.sourceId;

    const target =
      relationship.targetId;

    nodeScores[source] =
      (nodeScores[source] || 0) + 1;

    nodeScores[target] =
      (nodeScores[target] || 0) + 1;
  }

  const rankedNodes =
    Object.entries(nodeScores)
      .map(([node, score]) => ({
        node,
        score
      }))
      .sort((a, b) => b.score - a.score);

  return {
    request: userRequest,
    ranked_nodes: rankedNodes.slice(0, 10),
    graph_influence_active: true
  };
}
