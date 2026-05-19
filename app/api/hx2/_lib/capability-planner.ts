export type CandidateNode = {
  node: string;
  score: number;
  reason: string;
};

export type CapabilityPlan = {
  ok: boolean;
  user_request: string;
  intent: string;
  candidate_nodes: CandidateNode[];
  selected_node: string;
  execution_strategy: string;
  confidence: number;
  execution_results: any[];
  orchestration_synthesis: any;
  execution_pipeline: any[];
  request_complexity: any;
  execution_mode: string;
  escalation: any;
  planner_feedback: any;
  orchestration_summary: string;
};

function detectIntent(input: string): string {
  const text = input.toLowerCase();

  if (text.match(/sprint|build|deploy|debug|fix|guard|api|typescript|vercel|dev2|patch/i)) {
    return "buildops_execution";
  }

  if (text.match(/health|supplement|diet|symptom|vitamin|blood/i)) {
    return "health_analysis";
  }

  if (text.match(/crypto|xrp|bitcoin|market|stocks|silver/i)) {
    return "market_analysis";
  }

  if (text.match(/marketing|seo|sales|customer|brand/i)) {
    return "marketing_strategy";
  }

  if (text.match(/travel|flight|hotel|vacation/i)) {
    return "travel_planning";
  }

  if (text.match(/parent|child|school|reading|tutor/i)) {
    return "parenting_support";
  }

  return "general_reasoning";
}


function applyAdaptiveNodeScoring(
  candidateNodes: CandidateNode[]
): CandidateNode[] {

  const learning =
    buildPlannerLearningSignals();

  const frequency =
    learning?.node_frequency || {};

  return candidateNodes
    .map((node) => {

      const usageBoost =
        (frequency[node.node] || 0) * 0.02;

      return {
        ...node,
        score: Number(
          Math.min(
            1,
            node.score + usageBoost
          ).toFixed(2)
        )
      };
    })
    .sort(
      (a, b) => b.score - a.score
    );
}

function scoreNodes(intent: string): CandidateNode[] {

  switch (intent) {

    case "buildops_execution":
      return [
        { node: "DEV2", score: 0.96, reason: "Primary build and sprint execution node" },
        { node: "AP2", score: 0.84, reason: "Execution orchestration support" },
        { node: "DA2", score: 0.68, reason: "Failure-mode review" }
      ];

    case "health_analysis":
      return [
        { node: "AH2", score: 0.94, reason: "Primary health analysis node" },
        { node: "DA2", score: 0.71, reason: "Risk/challenge analysis" }
      ];

    case "market_analysis":
      return [
        { node: "X2", score: 0.95, reason: "Primary market intelligence node" },
        { node: "H2", score: 0.82, reason: "Macro/narrative correlation" },
        { node: "DA2", score: 0.66, reason: "Counter-analysis layer" }
      ];

    case "marketing_strategy":
      return [
        { node: "K2", score: 0.93, reason: "Marketing optimization node" },
        { node: "DA2", score: 0.63, reason: "Challenge assumptions" }
      ];

    case "travel_planning":
      return [
        { node: "TravelOI", score: 0.92, reason: "Travel orchestration node" },
        { node: "DA2", score: 0.58, reason: "Risk evaluation" }
      ];

    case "parenting_support":
      return [
        { node: "PA2", score: 0.91, reason: "Parenting guidance node" },
        { node: "DA2", score: 0.61, reason: "Developmental challenge analysis" }
      ];

    default:
      return [
        { node: "HX2", score: 0.75, reason: "General orchestration reasoning" },
        { node: "DA2", score: 0.55, reason: "Challenge analysis" }
      ];
  }
}

function strategyFor(intent: string): string {

  switch (intent) {

    case "buildops_execution":
      return "DEV2 build planning and execution orchestration";

    case "health_analysis":
      return "mechanism-first health evaluation";

    case "market_analysis":
      return "multi-node market and narrative orchestration";

    case "marketing_strategy":
      return "brand and conversion optimization";

    case "travel_planning":
      return "cost/risk optimized travel orchestration";

    case "parenting_support":
      return "development-aware parenting guidance";

    default:
      return "general orchestration reasoning";
  }
}

import { simulateNodeExecution } from "./capability-execution";
import { buildOrchestrationSynthesis } from "./capability-synthesis";
import { buildExecutionPipeline } from "./capability-pipeline";
import { assessRequestComplexity } from "./capability-complexity";
import { evaluateExecutionEscalation } from "./capability-escalation";
import { recordPlannerExecution } from "./capability-memory";
import { buildPlannerLearningSignals } from "./capability-learning";
import { evaluatePlannerFeedback } from "./capability-feedback";

export function buildCapabilityPlan(userRequest: string): CapabilityPlan {

  const intent = detectIntent(userRequest);

  const candidateNodes = scoreNodes(intent);

  const selectedNode =
    [...candidateNodes]
      .sort((a, b) => b.score - a.score)[0]?.node || "HX2";

  const requestComplexity =
    assessRequestComplexity(userRequest, candidateNodes);

  const escalation =
    evaluateExecutionEscalation(
      requestComplexity.execution_mode,
      candidateNodes[0]?.score || 0.5,
      candidateNodes
    );

  const finalExecutionMode =
    escalation.final_mode;


  const executionResults =
    simulateNodeExecution(intent, selectedNode, finalExecutionMode);

  const plannerFeedback =
    evaluatePlannerFeedback(
      executionResults,
      finalExecutionMode
    );

  recordPlannerExecution({
    timestamp: new Date().toISOString(),
    intent,
    selected_node: selectedNode,
    execution_mode: finalExecutionMode,
    escalation: escalation.escalated,
    completed_nodes:
      executionResults.filter(
        (r: any) => r.status === "complete"
      ).length
  });

  const orchestrationSynthesis =
    buildOrchestrationSynthesis(executionResults);

  const executionPipeline =
    finalExecutionMode === "pipeline"
      ? buildExecutionPipeline(candidateNodes)
      : buildExecutionPipeline(
          candidateNodes.slice(
            0,
            finalExecutionMode === "multi_node" ? 2 : 1
          )
        );

  return {
    ok: true,
    user_request: userRequest,
    intent,
    candidate_nodes: candidateNodes,
    selected_node: selectedNode,
    execution_strategy: strategyFor(intent),
    confidence: candidateNodes[0]?.score || 0.5,
    execution_results: executionResults,
    orchestration_synthesis: orchestrationSynthesis,
    execution_pipeline: executionPipeline,
    request_complexity: requestComplexity,
    execution_mode: finalExecutionMode,
    escalation: escalation,
    planner_feedback: plannerFeedback,
    orchestration_summary:
      `Planner selected ${selectedNode} for ${intent}.`
  };
}













