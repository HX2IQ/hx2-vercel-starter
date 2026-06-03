param(
  [string]$BaseUrl = "https://optinodeiq.com",
  [switch]$LiveVerify
)

$ErrorActionPreference = "Stop"

Write-Host "`n== DEV2 PHASE 7 BUILD-SPEED LAYER =="

$Routes = @(
  @{
    Slug = "phase7-execution-sandbox"
    Stage = "phase7_execution_sandbox"
    Mode = "read_only_phase7_execution_sandbox"
    Capability = "autonomous_execution_sandbox_contract"
  },
  @{
    Slug = "phase7-recovery-mesh"
    Stage = "phase7_recovery_mesh"
    Mode = "read_only_phase7_recovery_mesh"
    Capability = "deterministic_recovery_mesh_contract"
  },
  @{
    Slug = "phase7-fault-isolation"
    Stage = "phase7_fault_isolation"
    Mode = "read_only_phase7_fault_isolation"
    Capability = "orchestration_fault_isolation_contract"
  },
  @{
    Slug = "phase7-execution-replay"
    Stage = "phase7_execution_replay"
    Mode = "read_only_phase7_execution_replay"
    Capability = "execution_replay_engine_contract"
  },
  @{
    Slug = "phase7-rollback-validator"
    Stage = "phase7_rollback_validator"
    Mode = "read_only_phase7_rollback_validator"
    Capability = "autonomous_rollback_validation_contract"
  },
  @{
    Slug = "phase7-master-status"
    Stage = "phase7_master_status"
    Mode = "read_only_phase7_master_status"
    Capability = "phase7_master_status_contract"
  }
)

function New-Phase7Route {
  param(
    [hashtable]$Route
  )

  $Folder = ".\app\api\hx2\$($Route.Slug)"
  $File = Join-Path $Folder "route.ts"

  New-Item -ItemType Directory -Force -Path $Folder | Out-Null

@"
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {

  return NextResponse.json({
    ok: true,

    route:
      "/api/hx2/$($Route.Slug)",

    mode:
      "$($Route.Mode)",

    mutation_allowed: false,

    orchestration_stage:
      "$($Route.Stage)",

    phase:
      7,

    phase7_foundation_active:
      true,

    capability:
      "$($Route.Capability)",

    contract_status:
      "foundation_scaffold",

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

    dev2: {
      build_speed_layer_active: true,
      batch_route_generation_active: true,
      shared_contract_template_active: true,
      grouped_route_verification_active: true,
      deterministic_validation_required: true,
      typescript_required: true,
      build_required: true,
      artifact_check_required: true,
      live_route_verification_required_before_phase7_promotion: true,
      orchestration_safe: true
    }
  });
}
"@ | Set-Content -Path $File -Encoding UTF8
}

function Test-LocalRouteSource {
  param(
    [hashtable]$Route
  )

  $File = ".\app\api\hx2\$($Route.Slug)\route.ts"

  if (!(Test-Path $File)) {
    throw "Missing route.ts for $($Route.Slug)"
  }

  $Text = Get-Content $File -Raw

  foreach ($Required in @($Route.Mode, $Route.Stage, $Route.Capability, "mutation_allowed", "false")) {
    if ($Text -notmatch [regex]::Escape($Required)) {
      throw "Route source contract missing '$Required' in $File"
    }
  }

  Write-Host "SOURCE OK: $($Route.Slug)"
}

function Test-BuildArtifact {
  param(
    [hashtable]$Route
  )

  $Artifact = ".\.next\server\app\api\hx2\$($Route.Slug)\route.js"

  if (!(Test-Path $Artifact)) {
    throw "Missing build artifact: $Artifact"
  }

  Write-Host "ARTIFACT OK: $($Route.Slug)"
}

function Test-LiveRoute {
  param(
    [hashtable]$Route
  )

  $Url = "$BaseUrl/api/hx2/$($Route.Slug)"

  $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
  $Json = $Response.Content | ConvertFrom-Json

  if ($Response.StatusCode -ne 200) {
    throw "Bad status for $Url : $($Response.StatusCode)"
  }

  if ($Json.ok -ne $true) {
    throw "Bad ok flag for $Url"
  }

  if ($Json.route -ne "/api/hx2/$($Route.Slug)") {
    throw "Route mismatch for $Url"
  }

  if ($Json.mode -ne $Route.Mode) {
    throw "Mode mismatch for $Url"
  }

  Write-Host "LIVE OK: $($Route.Slug)"
}

Write-Host "`n== BATCH GENERATE ROUTES =="
foreach ($Route in $Routes) {
  New-Phase7Route -Route $Route
}

Write-Host "`n== LOCAL SOURCE CONTRACT CHECK =="
foreach ($Route in $Routes) {
  Test-LocalRouteSource -Route $Route
}

Write-Host "`n== TYPESCRIPT VERIFY =="
npx tsc --noEmit --pretty false

Write-Host "`n== BUILD VERIFY =="
npm run build

Write-Host "`n== BUILD ARTIFACT CHECK =="
foreach ($Route in $Routes) {
  Test-BuildArtifact -Route $Route
}

if ($LiveVerify) {
  Write-Host "`n== LIVE ROUTE VERIFY =="
  foreach ($Route in $Routes) {
    Test-LiveRoute -Route $Route
  }
}
else {
  Write-Host "`nLIVE VERIFY SKIPPED: run again with -LiveVerify after deploy."
}

Write-Host "`n== DEV2 PHASE 7 SPEED LAYER COMPLETE =="
