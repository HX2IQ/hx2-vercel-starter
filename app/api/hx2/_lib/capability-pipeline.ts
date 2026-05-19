export type ExecutionStep = {
  step: number;
  node: string;
  action: string;
  depends_on: number[];
};

export function buildExecutionPipeline(
  candidateNodes: any[]
): ExecutionStep[] {

  return candidateNodes.map(
    (node: any, index: number) => ({
      step: index + 1,
      node: node.node,
      action: `Execute ${node.node} analysis`,
      depends_on:
        index === 0
          ? []
          : [index]
    })
  );
}
