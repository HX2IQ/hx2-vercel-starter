import { buildKgxGraphContext } from "./kgx-context-builder";
import { buildKgxPlannerInfluence } from "./kgx-planner-influence";
import { buildKgxExecutionLearning } from "./kgx-execution-learning";
import { buildKgxNodeEffectiveness } from "./kgx-node-effectiveness";
import { buildKgxSpecializationLearning } from "./kgx-specialization-learning";
import { buildKgxReinforcementConsumption } from "./kgx-reinforcement-consumption";
import { buildKgxOrchestrationAssembly } from "./kgx-orchestration-assembly";
import { buildKgxRoutingReinforcement } from "./kgx-routing-reinforcement";
import { buildKgxConfidenceAdjustment } from "./kgx-confidence-adjustment";
import { buildKgxNodePromotion } from "./kgx-node-promotion";
import { buildKgxContextTags } from "./kgx-context-tags";
import { buildKgxContextualRoutingBias } from "./kgx-contextual-routing-bias";
import { buildKgxAssemblyEffectiveness } from "./kgx-assembly-effectiveness";
import { buildKgxAssemblyRecommendation } from "./kgx-assembly-recommendation";
import { buildKgxContextualAssemblyRecommendation } from "./kgx-contextual-assembly-recommendation";
import { buildKgxCombinationSynergyInfluence } from "./kgx-combination-synergy-influence";

export async function buildKgxAdaptiveNodeSelection(userRequest: string) {
  const graphContext = await buildKgxGraphContext(userRequest);
  const plannerInfluence = await buildKgxPlannerInfluence(userRequest);
  const executionLearning = await buildKgxExecutionLearning();
  const nodeEffectiveness = await buildKgxNodeEffectiveness();
  const specializationLearning = await buildKgxSpecializationLearning(userRequest);
  const reinforcementConsumption = await buildKgxReinforcementConsumption();
  const routingReinforcement = await buildKgxRoutingReinforcement();
  const contextualTags = buildKgxContextTags(userRequest);
  const contextualRoutingBias =
    await buildKgxContextualRoutingBias(contextualTags.tags);
  const assemblyEffectiveness =
    await buildKgxAssemblyEffectiveness();
  const assemblyRecommendation =
    await buildKgxAssemblyRecommendation();
  const contextualAssemblyRecommendation =
    await buildKgxContextualAssemblyRecommendation(userRequest);
  const combinationSynergyInfluence =
    await buildKgxCombinationSynergyInfluence(userRequest);

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

  const contextualBiasTrace: any[] = [];

  for (const [node, boost] of Object.entries(contextualRoutingBias.boosts || {})) {
    const before = scores[node] || 0;
    const after = before + Number(boost || 0);

    contextualBiasTrace.push({
      node,
      before: Math.round(before * 10) / 10,
      boost: Number(boost || 0),
      after: Math.round(after * 10) / 10
    });

    scores[node] = after;
  }

  const combinationSynergyTrace: any[] = [];

  if (
    combinationSynergyInfluence.found &&
    combinationSynergyInfluence.best_assembly &&
    combinationSynergyInfluence.influence_boost > 0
  ) {
    const synergyNodes =
      String(combinationSynergyInfluence.best_assembly)
        .split("+")
        .map(x => x.trim())
        .filter(Boolean);

    for (const node of synergyNodes) {
      const before = scores[node] || 0;
      const boost = Number(combinationSynergyInfluence.influence_boost || 0);
      const after = before + boost;

      combinationSynergyTrace.push({
        node,
        before: Math.round(before * 10) / 10,
        boost,
        after: Math.round(after * 10) / 10
      });

      scores[node] = after;
    }
  }
  const reinforcementScoreTrace: any[] = [];

  for (const [node, weight] of Object.entries(reinforcementConsumption.weights || {})) {
    if (scores[node] !== undefined) {
      const before = scores[node];
      const multiplier = Number(weight || 1);
      const after = before * multiplier;

      reinforcementScoreTrace.push({
        node,
        before: Math.round(before * 10) / 10,
        multiplier,
        after: Math.round(after * 10) / 10
      });

      scores[node] = after;
    }
  }

  const rawRecommendations = Object.entries(scores)
    .map(([node, score]) => ({
      node,
      score: Math.round(score * 10) / 10
    }))
    .filter(x => x.node !== "HX2")
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

  const selectedAssemblyRecommendation =
    contextualAssemblyRecommendation.found
      ? contextualAssemblyRecommendation
      : assemblyRecommendation;

  const orchestrationAssembly =
    selectedAssemblyRecommendation.found
      ? {
          orchestration_assembly_active: true,
          assembly_recommendation_consumption_active: true,
          forced_challenge_role_active: true,
          roles: [
            {
              role: "primary",
              node: selectedAssemblyRecommendation.recommended_primary,
              confidence: 1,
              reason: "assembly recommendation primary"
            },
            {
              role: "challenge",
              node: selectedAssemblyRecommendation.recommended_challenge,
              confidence: 0.75,
              reason: "assembly recommendation challenge"
            },
            {
              role: "validation",
              node: selectedAssemblyRecommendation.recommended_validation,
              confidence: 0.65,
              reason: "assembly recommendation validation"
            },
            {
              role: "secondary",
              node: selectedAssemblyRecommendation.recommended_secondary,
              confidence: 0.5,
              reason: "assembly recommendation secondary"
            }
          ].filter(x => x.node),
          primary_node: selectedAssemblyRecommendation.recommended_primary,
          challenge_node: selectedAssemblyRecommendation.recommended_challenge,
          validation_node: selectedAssemblyRecommendation.recommended_validation,
          secondary_node: selectedAssemblyRecommendation.recommended_secondary,
          recommended_assembly: selectedAssemblyRecommendation.recommended_assembly,
          effectiveness_score:
            (selectedAssemblyRecommendation as any).contextual_effectiveness_score ||
            (selectedAssemblyRecommendation as any).effectiveness_score ||
            0
        }
      : buildKgxOrchestrationAssembly(recommendations);

  return {
    adaptive_selection_active: true,
    contextual_bias_injection_active: true,
    assembly_effectiveness_injection_active: true,
    assembly_recommendation_consumption_active: selectedAssemblyRecommendation.found,
    combination_synergy_consumption_active: combinationSynergyInfluence.found,
    contextual_assembly_recommendation_consumption_active: contextualAssemblyRecommendation.found,
    reinforcement_weight_injection_active: true,
    specialist_priority_override_active: true,
    self_optimizing_routing_active: true,
    orchestrator_role_separation_active: true,
    request: userRequest,
    recommended_node: recommendations[0]?.node || "HX2",
    recommendation_score: recommendations[0]?.score || 0,
    recommendations,
    contextual_tags: contextualTags,
    contextual_routing_bias: contextualRoutingBias,
    assembly_effectiveness: assemblyEffectiveness,
    assembly_recommendation: assemblyRecommendation,
    contextual_assembly_recommendation: contextualAssemblyRecommendation,
    selected_assembly_recommendation: selectedAssemblyRecommendation,
    combination_synergy_influence: combinationSynergyInfluence,
    combination_synergy_trace: combinationSynergyTrace,
    contextual_bias_trace: contextualBiasTrace,
    specialization_learning: specializationLearning,
    reinforcement_consumption: reinforcementConsumption,
    reinforcement_score_trace: reinforcementScoreTrace,
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
      contextual_tags: contextualTags.tags.length,
      contextual_bias_nodes: Object.keys(contextualRoutingBias.boosts || {}).length,
      assembly_effectiveness_rankings: assemblyEffectiveness.rankings.length,
      assembly_recommendation_found: assemblyRecommendation.found,
      contextual_assembly_recommendation_found: contextualAssemblyRecommendation.found,
      combination_synergy_found: combinationSynergyInfluence.found,
      reinforcement_weighted_nodes: Object.keys(reinforcementConsumption.weights || {}).length,
      reinforcement_nodes: routingReinforcement.rankings.length
    }
  };
}




