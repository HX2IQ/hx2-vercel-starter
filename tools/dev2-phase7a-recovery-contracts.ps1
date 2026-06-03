$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 7A RECOVERY CONTRACTS =="

$Contracts = @{
  "phase7-execution-sandbox" = @{
    Stage = "phase7_execution_sandbox"
    Mode = "read_only_phase7_execution_sandbox"
    Capability = "autonomous_execution_sandbox_contract"
    Domain = "sandbox_boundary_validation"
  }
  "phase7-recovery-mesh" = @{
    Stage = "phase7_recovery_mesh"
    Mode = "read_only_phase7_recovery_mesh"
    Capability = "deterministic_recovery_mesh_contract"
    Domain = "recovery_dependency_mapping"
  }
  "phase7-fault-isolation" = @{
    Stage = "phase7_fault_isolation"
    Mode = "read_only_phase7_fault_isolation"
    Capability = "orchestration_fault_isolation_contract"
    Domain = "fault_containment_scoping"
  }
  "phase7-execution-replay" = @{
    Stage = "phase7_execution_replay"
    Mode = "read_only_phase7_execution_replay"
    Capability = "execution_replay_engine_contract"
    Domain = "execution_trace_replay_contracts"
  }
  "phase7-rollback-validator" = @{
    Stage = "phase7_rollback_validator"
    Mode = "read_only_phase7_rollback_validator"
    Capability = "autonomous_rollback_validation_contract"
    Domain = "rollback_eligibility_validation"
  }
  "phase7-master-status" = @{
    Stage = "phase7_master_status"
    Mode = "read_only_phase7_master_status"
    Capability = "phase7_master_status_contract"
    Domain = "phase7_contract_readiness_summary"
  }
}

foreach ($Slug in $Contracts.Keys) {
  $C = $Contracts[$Slug]
  $File = ".\app\api\hx2\$Slug\route.ts"

@"
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const recoveryContracts = [
  {
    contract_id: "phase7_recovery_dependency_map",
    status: "contract_ready",
    mutation_allowed: false
  },
  {
    contract_id: "phase7_execution_checkpoint_structure",
    status: "contract_ready",
    mutation_allowed: false
  },
  {
    contract_id: "phase7_replay_compatibility_contract",
    status: "contract_ready",
    mutation_allowed: false
  },
  {
    contract_id: "phase7_rollback_eligibility_contract",
    status: "contract_ready",
    mutation_allowed: false
  },
  {
    contract_id: "phase7_fault_containment_scope",
    status: "contract_ready",
    mutation_allowed: false
  }
];

export async function GET() {

  return NextResponse.json({
    ok: true,

    route:
      "/api/hx2/$Slug",

    mode:
      "$($C.Mode)",

    mutation_allowed: false,

    orchestration_stage:
      "$($C.Stage)",

    phase:
      7,

    phase7a_recovery_contracts_active:
      true,

    capability:
      "$($C.Capability)",

    contract_domain:
      "$($C.Domain)",

    contract_status:
      "phase7a_contract_stabilization",

    recovery_contracts:
      recoveryContracts,

    recovery_logic_active:
      false,

    replay_logic_active:
      false,

    rollback_logic_active:
      false,

    fault_isolation_logic_active:
      false,

    self_healing_logic_active:
      false,

    promotion_gate: {
      requires_typescript: true,
      requires_build: true,
      requires_artifact_check: true,
      requires_live_route_verification: true,
      mutation_blocked_until_contracts_stable: true
    },

    dev2: {
      build_speed_layer_active: true,
      deterministic_validation_required: true,
      contract_first_active: true,
      orchestration_safe: true
    }
  });
}
"@ | Set-Content -Path $File -Encoding UTF8
}

Write-Host "`n== TYPESCRIPT VERIFY =="
npx tsc --noEmit --pretty false

Write-Host "`n== BUILD VERIFY =="
npm run build

Write-Host "`n== ARTIFACT VERIFY =="

foreach ($Slug in $Contracts.Keys) {
  $Artifact = ".\.next\server\app\api\hx2\$Slug\route.js"

  if (!(Test-Path $Artifact)) {
    throw "Missing artifact: $Artifact"
  }

  Write-Host "ARTIFACT OK: $Slug"
}

Write-Host "`n== STATUS =="
git status --short
