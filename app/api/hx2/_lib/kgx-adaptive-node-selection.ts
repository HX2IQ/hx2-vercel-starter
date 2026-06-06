import { buildKgxGraphContext } from "./kgx-context-builder";
import { buildKgxPlannerInfluence } from "./kgx-planner-influence";
import { buildKgxExecutionLearning } from "./kgx-execution-learning";
import { buildKgxNodeEffectiveness } from "./kgx-node-effectiveness";
import { buildKgxSpecializationLearning } from "./kgx-specialization-learning";
import { buildKgxOrchestrationAssembly } from "./kgx-orchestration-assembly";
import { buildKgxRoutingReinforcement } from "./kgx-routing-reinforcement";
import { buildKgxConfidenceAdjustment } from "./kgx-confidence-adjustment";
import { buildKgxNodePromotion } from "./kgx-node-promotion";

export async function buildKgxAdaptiveNodeSelection(userRequest: string) {
  const graphContext = await buildKgxGraphContext(userRequest);
  const plannerInfluence = await buildKgxPlannerInfluence(userRequest);
  const executionLearning = await buildKgxExecutionLearning();
  const nodeEffectiveness = await buildKgxNodeEffectiveness();
  const specializationLearning = await buildKgxSpecializationLearning(userRequest);
  const routingReinforcement = await buildKgxRoutingReinforcement();

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
    scores[item.node] = (scores[item.node] || 0) + item.confidence * 250;
  }

  for (const item of routingReinforcement.rankings || []) {
    scores[item.node] = (scores[item.node] || 0) + item.net_score * 0.5;
  }

  const rawRecommendations = Object.entries(scores)
    .map(([node, score]) => ({
      node,
      score: Math.round(score * 10) / 10
    }))
    .sort((a, b) => b.score - a.score);

  const specialist = specializationLearning.matches?.[0]?.node;

  const specialistEffectiveness =
    nodeEffectiveness.rankings.find(
      (x: any) => x.node === specialist
    );

  const specialistSeverelyFailed =
    specialistEffectiveness &&
    specialistEffectiveness.effectivenessScore < -50;

  const recommendations =
    specialist && !specialistSeverelyFailed
      ? [
          ...rawRecommendations.filter(x => x.node === specialist),
          ...rawRecommendations.filter(x => x.node !== specialist)
        ].slice(0, 10)
      : rawRecommendations.slice(0, 10);

  const confidenceAdjustment =
    buildKgxConfidenceAdjustment(recommendations, routingReinforcement);

  const nodePromotion =
    buildKgxNodePromotion(confidenceAdjustment);

  const orchestrationAssembly =
    buildKgxOrchestrationAssembly(recommendations);

  return {
    adaptive_selection_active: true,
    specialist_priority_override_active: true,
    self_optimizing_routing_active: true,
    request: userRequest,
    recommended_node: recommendations[0]?.node || "HX2",
    recommendation_score: recommendations[0]?.score || 0,
    recommendations,
    specialization_learning: specializationLearning,
    routing_reinforcement: routingReinforcement,
    confidence_adjustment: confidenceAdjustment,
    node_promotion: nodePromotion,
    orchestration_assembly: orchestrationAssembly,
    signals: {
      graph_context_items: graphContext.summary.ranked_items,
      planner_influence_nodes: plannerInfluence.ranked_nodes.length,
      learning_nodes: executionLearning.rankings.length,
      effectiveness_nodes: nodeEffectiveness.rankings.length,
      specialization_matches: specializationLearning.matches.length,
      reinforcement_nodes: routingReinforcement.rankings.length
    }
  };
}
