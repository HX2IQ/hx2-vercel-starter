export async function buildKgxTokenBudgetGuard() {
  return {
    guard_active: true,
    daily_token_budget: 100000,
    estimated_token_usage: 0,
    token_budget_ok: true
  };
}
