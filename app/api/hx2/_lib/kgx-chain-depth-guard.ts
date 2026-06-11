export async function buildKgxChainDepthGuard() {
  return {
    guard_active: true,
    max_chain_depth: 5,
    estimated_chain_depth: 1,
    chain_depth_ok: true
  };
}
