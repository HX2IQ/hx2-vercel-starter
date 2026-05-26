$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B ROUTE MODE CONTRACT GUARD =="

$Contracts = @(
  @{
    Path = "app/api/hx2/orchestration-compiler/route.ts"
    Field = "compiler_mode"
    Value = "read_only_preview"
  },
  @{
    Path = "app/api/hx2/orchestration-stage-dependencies/route.ts"
    Field = "dependency_mode"
    Value = "read_only_preview"
  },
  @{
    Path = "app/api/hx2/orchestration-stage-graph/route.ts"
    Field = "graph_mode"
    Value = "read_only_preview"
  },
  @{
    Path = "app/api/hx2/orchestration-execution-plan/route.ts"
    Field = "plan_mode"
    Value = "read_only_preview"
  },
  @{
    Path = "app/api/hx2/phase3b-orchestration-status/route.ts"
    Field = "status_mode"
    Value = "read_only_snapshot"
  },
  @{
    Path = "app/api/hx2/phase3b-release-manifest/route.ts"
    Field = "release_mode"
    Value = "deterministic_orchestration_preview"
  },
  @{
    Path = "app/api/hx2/phase3b-route-matrix/route.ts"
    Field = "matrix_mode"
    Value = "read_only_contract"
  }
)

foreach ($Contract in $Contracts) {
  if (!(Test-Path $Contract.Path)) {
    throw "Missing route file: $($Contract.Path)"
  }

  $Content = Get-Content $Contract.Path -Raw

  if ($Content -notmatch [regex]::Escape($Contract.Field)) {
    throw "Route missing mode field '$($Contract.Field)': $($Contract.Path)"
  }

  if ($Content -notmatch [regex]::Escape($Contract.Value)) {
    throw "Route missing expected mode value '$($Contract.Value)': $($Contract.Path)"
  }
}

Write-Host "PHASE 3B ROUTE MODE CONTRACT GUARD PASSED"
