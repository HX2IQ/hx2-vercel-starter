import { buildKgxTokenBudgetGuard } from "./kgx-token-budget-guard";
import { buildKgxNodeExecutionGuard } from "./kgx-node-execution-guard";
import { buildKgxChainDepthGuard } from "./kgx-chain-depth-guard";
import { buildKgxOwnerApprovalGate } from "./kgx-owner-approval-gate";

export async function buildKgxCostGuardAuthority() {
  const [
    tokenBudget,
    nodeExecution,
    chainDepth,
    approvalGate
  ] = await Promise.all([
    buildKgxTokenBudgetGuard(),
    buildKgxNodeExecutionGuard(),
    buildKgxChainDepthGuard(),
    buildKgxOwnerApprovalGate()
  ]);

  const executionAllowed =
    tokenBudget.token_budget_ok &&
    nodeExecution.node_budget_ok &&
    chainDepth.chain_depth_ok &&
    !approvalGate.owner_approval_required;

  return {
    cost_guard_authority_active: true,
    execution_allowed: executionAllowed,
    estimated_cost_band: "low",
    tokenBudget,
    nodeExecution,
    chainDepth,
    approvalGate
  };
}
