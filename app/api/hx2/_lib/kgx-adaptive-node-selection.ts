import { buildKgxGraphContext } from "./kgx-context-builder";
import { buildKgxPlannerInfluence } from "./kgx-planner-influence";
import { buildKgxExecutionLearning } from "./kgx-execution-learning";
import { buildKgxNodeEffectiveness } from "./kgx-node-effectiveness";
import { buildKgxSpecializationLearning } from "./kgx-specialization-learning";

export async function buildKgxAdaptiveNodeSelection(userRequest: string) {
  const graphContext = await buildKgxGraphContext(userRequest);
  const plannerInfluence = await buildKgxPlannerInfluence(userRequest);
  const executionLearning = await buildKgxExecutionLearning();
  const nodeEffectiveness = await buildKgxNodeEffectiveness();
  const specializationLearning = await buildKgxSpecializationLearning(userRequest);

  const scores: Record<string, number> = {};

  for (const node of graphContext.summary.related_nodes || []) {
    scores[node] = (scores[node] || 0) + 20;
  }

  for (const item of plannerInfluence.ranked_nodes || []) {
    scores[item.node] = (scores[item.node] || 0) + item.score * 5;
  }

  for (const item of executionLearning.rankings || []) {
    scores[item.node] = (scores[item.node] || 0) + item.effectivenessScore * 0.25;
  }

  for (const item of nodeEffectiveness.rankings || []) {
    scores[item.node] = (scores[item.node] || 0) + item.effectivenessScore;
  }

  for (const item of specializationLearning.matches || []) {
    scores[item.node] = (scores[item.node] || 0) + item.confidence * 75;
  }

  const recommendations = Object.entries(scores)
    .map(([node, score]) => ({
      node,
      score: Math.round(score * 10) / 10
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    adaptive_selection_active: true,
    request: userRequest,
    recommended_node: recommendations[0]?.node || "HX2",
    recommendation_score: recommendations[0]?.score || 0,
    recommendations,
    specialization_learning: specializationLearning,
    signals: {
      graph_context_items: graphContext.summary.ranked_items,
      planner_influence_nodes: plannerInfluence.ranked_nodes.length,
      learning_nodes: executionLearning.rankings.length,
      effectiveness_nodes: nodeEffectiveness.rankings.length,
      specialization_matches: specializationLearning.matches.length
    }
  };
}

