export async function buildKgxOwnerApprovalGate() {
  return {
    guard_active: true,
    approval_threshold: "high",
    owner_approval_required: false
  };
}
