export type EscalationDecision = {
  escalated: boolean;
  original_mode: string;
  final_mode: string;
  reason: string;
};

export function evaluateExecutionEscalation(
  executionMode: string,
  confidence: number,
  candidateNodes: any[]
): EscalationDecision {

  if (
    executionMode === "single_node" &&
    (
      confidence < 0.75 ||
      candidateNodes.length >= 3
    )
  ) {
    return {
      escalated: true,
      original_mode: executionMode,
      final_mode: "multi_node",
      reason: "Low confidence or multiple node candidates."
    };
  }

  if (
    executionMode === "multi_node" &&
    confidence < 0.65
  ) {
    return {
      escalated: true,
      original_mode: executionMode,
      final_mode: "pipeline",
      reason: "Confidence threshold triggered full orchestration."
    };
  }

  return {
    escalated: false,
    original_mode: executionMode,
    final_mode: executionMode,
    reason: "No escalation required."
  };
}
