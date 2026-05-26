$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B ROUTE MODE CONTRACT GUARD =="

$Contracts = @(
  @{
    RoutePath = "app/api/hx2/orchestration-compiler/route.ts"
    HelperPath = "app/api/hx2/_lib/orchestration-compiler.ts"
    Field = "compiler_mode"
    Value = "read_only_preview"
  },
  @{
    RoutePath = "app/api/hx2/orchestration-stage-dependencies/route.ts"
    HelperPath = "app/api/hx2/_lib/orchestration-stage-dependency-registry.ts"
    Field = "dependency_mode"
    Value = "read_only_preview"
  },
  @{
    RoutePath = "app/api/hx2/orchestration-stage-graph/route.ts"
    HelperPath = "app/api/hx2/_lib/orchestration-stage-graph.ts"
    Field = "graph_mode"
    Value = "read_only_preview"
  },
  @{
    RoutePath = "app/api/hx2/orchestration-execution-plan/route.ts"
    HelperPath = "app/api/hx2/_lib/orchestration-execution-plan.ts"
    Field = "plan_mode"
    Value = "read_only_preview"
  },
  @{
    RoutePath = "app/api/hx2/phase3b-orchestration-status/route.ts"
    HelperPath = "app/api/hx2/_lib/phase3b-orchestration-status.ts"
    Field = "status_mode"
    Value = "read_only_snapshot"
  },
  @{
    RoutePath = "app/api/hx2/phase3b-release-manifest/route.ts"
    HelperPath = "app/api/hx2/_lib/phase3b-release-manifest.ts"
    Field = "release_mode"
    Value = "deterministic_orchestration_preview"
  },
  @{
    RoutePath = "app/api/hx2/phase3b-route-matrix/route.ts"
    HelperPath = "app/api/hx2/_lib/phase3b-route-matrix.ts"
    Field = "matrix_mode"
    Value = "read_only_contract"
  }
)

foreach ($Contract in $Contracts) {
  if (!(Test-Path $Contract.RoutePath)) {
    throw "Missing route file: $($Contract.RoutePath)"
  }

  if (!(Test-Path $Contract.HelperPath)) {
    throw "Missing helper file: $($Contract.HelperPath)"
  }

  $Combined = ((Get-Content $Contract.RoutePath -Raw) + "`n" + (Get-Content $Contract.HelperPath -Raw))

  if ($Combined -notmatch [regex]::Escape($Contract.Field)) {
    throw "Route/helper missing mode field '$($Contract.Field)': $($Contract.RoutePath)"
  }

  if ($Combined -notmatch [regex]::Escape($Contract.Value)) {
    throw "Route/helper missing expected mode value '$($Contract.Value)': $($Contract.RoutePath)"
  }
}

Write-Host "PHASE 3B ROUTE MODE CONTRACT GUARD PASSED"
