import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const controlledExecutionSandboxContracts = [
  {
    sandbox_contract_id: "controlled_execution_boundary",
    execution_allowed: false,
    mutation_allowed: false
  },
  {
    sandbox_contract_id: "permission_model_required",
    execution_allowed: false,
    mutation_allowed: false
  },
  {
    sandbox_contract_id: "dry_run_to_controlled_transition_guard",
    execution_allowed: false,
    mutation_allowed: false
  },
  {
    sandbox_contract_id: "runtime_boundary_validation",
    execution_allowed: false,
    mutation_allowed: false
  },
  {
    sandbox_contract_id: "operator_promotion_required",
    execution_allowed: false,
    mutation_allowed: false
  }
];

export async function GET() {

  return NextResponse.json({
    ok: true,

    route:
      "/api/hx2/phase9-execution-permission-model",

    mode:
      "read_only_phase9_controlled_execution_sandbox",

    mutation_allowed: false,

    execution_allowed: false,

    phase:
      9,

    phase9a_controlled_execution_sandbox_active:
      true,

    contract_status:
      "phase9a_controlled_execution_sandbox_stabilization",

    controlled_execution_sandbox_contracts:
      controlledExecutionSandboxContracts,

    autonomous_execution_active:
      false,

    controlled_execution_active:
      false,

    mutation_execution_active:
      false,

    rollback_execution_active:
      false,

    self_healing_execution_active:
      false,

    dev2: {
      controlled_execution_sandbox_active: true,
      operator_promotion_required: true,
      mutation_block_active: true,
      execution_block_active: true,
      orchestration_safe: true
    }
  });
}
