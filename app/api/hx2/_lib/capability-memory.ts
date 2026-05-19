export type PlannerMemoryRecord = {
  timestamp: string;
  intent: string;
  selected_node: string;
  execution_mode: string;
  escalation: boolean;
  completed_nodes: number;
};

const plannerMemory: PlannerMemoryRecord[] = [];

export function recordPlannerExecution(record: PlannerMemoryRecord) {
  plannerMemory.unshift(record);

  if (plannerMemory.length > 25) {
    plannerMemory.pop();
  }
}

export function getPlannerMemory() {
  return plannerMemory;
}
