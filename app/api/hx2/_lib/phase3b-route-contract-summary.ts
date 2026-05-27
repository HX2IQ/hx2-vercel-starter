import { getPhase3BRouteMatrix } from "./phase3b-route-matrix";

export function getPhase3BRouteContractSummary() {
  const matrix = getPhase3BRouteMatrix();

  return {
    ok: matrix.ok === true,
    summary_id: "hx2-phase3b-route-contract-summary",
    phase: "phase_3b",
    summary_mode: "read_only_contract_summary",
    composition_mutation_allowed: false,
    route_count: matrix.routes.length,
    contracts: matrix.routes.map((entry) => ({
      route: entry.route,
      contract: entry.contract,
      expected_mode: entry.expected_mode,
    })),
  };
}
