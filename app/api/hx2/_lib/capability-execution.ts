export type SimulatedNodeResult = {
  node: string;
  status: string;
  summary: string;
};

export function simulateNodeExecution(
  intent: string,
  selectedNode: string,
  executionMode: string = "pipeline"
): SimulatedNodeResult[] {

  if (executionMode === "single_node") {
    return [
      {
        node: selectedNode,
        status: "complete",
        summary: `Single-node execution completed by ${selectedNode}.`
      }
    ];
  }

  switch (intent) {

    case "health_analysis":
      return [
        {
          node: "AH2",
          status: "complete",
          summary: "Mechanism-first health analysis prepared."
        },
        {
          node: "DA2",
          status: "complete",
          summary: "Risk review completed."
        }
      ];

    case "market_analysis":
      return [
        {
          node: "X2",
          status: "complete",
          summary: "Market trend analysis completed."
        },
        {
          node: "H2",
          status: "complete",
          summary: "Narrative/macro correlation completed."
        },
        {
          node: "DA2",
          status: "complete",
          summary: "Counter-analysis completed."
        }
      ];

    case "marketing_strategy":
      return [
        {
          node: "K2",
          status: "complete",
          summary: "Marketing optimization prepared."
        },
        {
          node: "DA2",
          status: "complete",
          summary: "Challenge analysis completed."
        }
      ];

    case "travel_planning":
      return [
        {
          node: "TravelOI",
          status: "complete",
          summary: "Travel orchestration prepared."
        }
      ];

    case "parenting_support":
      return [
        {
          node: "PA2",
          status: "complete",
          summary: "Development-aware parenting guidance prepared."
        }
      ];

    default:
      return [
        {
          node: selectedNode,
          status: "complete",
          summary: "General orchestration reasoning completed."
        }
      ];
  }
}

