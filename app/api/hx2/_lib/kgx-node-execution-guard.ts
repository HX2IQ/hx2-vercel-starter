export async function buildKgxNodeExecutionGuard() {
  return {
    guard_active: true,
    max_node_executions: 25,
    estimated_node_executions: 0,
    node_budget_ok: true
  };
}
