export type OrchestrationSynthesis = {
  participating_nodes: string[];
  completed_nodes: number;
  total_nodes: number;
  execution_status: string;
  synthesis_summary: string;
};

export function buildOrchestrationSynthesis(
  executionResults: any[]
): OrchestrationSynthesis {

  const participatingNodes =
    executionResults.map((r: any) => r.node);

  const completedNodes =
    executionResults.filter(
      (r: any) => r.status === "complete"
    ).length;

  const totalNodes =
    executionResults.length;

  const executionStatus =
    completedNodes === totalNodes
      ? "complete"
      : completedNodes > 0
      ? "partial"
      : "failed";

  return {
    participating_nodes: participatingNodes,
    completed_nodes: completedNodes,
    total_nodes: totalNodes,
    execution_status: executionStatus,
    synthesis_summary:
      `Executed ${completedNodes}/${totalNodes} orchestration nodes.`
  };
}
