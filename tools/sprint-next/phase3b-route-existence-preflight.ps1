$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B ROUTE EXISTENCE PREFLIGHT =="

$RequiredRoutes = @(
  "app/api/hx2/orchestration-compiler/route.ts",
  "app/api/hx2/orchestration-stage-dependencies/route.ts",
  "app/api/hx2/orchestration-stage-graph/route.ts",
  "app/api/hx2/orchestration-execution-plan/route.ts",
  "app/api/hx2/phase3b-orchestration-status/route.ts",
  "app/api/hx2/phase3b-release-manifest/route.ts",
  "app/api/hx2/phase3b-route-matrix/route.ts",
  "app/api/hx2/phase3b-route-contract-summary/route.ts",
  "app/api/hx2/phase3b-sprint-snapshot/route.ts"
)

$RequiredHelpers = @(
  "app/api/hx2/_lib/orchestration-compiler.ts",
  "app/api/hx2/_lib/orchestration-stage-dependency-registry.ts",
  "app/api/hx2/_lib/orchestration-stage-graph.ts",
  "app/api/hx2/_lib/orchestration-execution-plan.ts",
  "app/api/hx2/_lib/phase3b-orchestration-status.ts",
  "app/api/hx2/_lib/phase3b-release-manifest.ts",
  "app/api/hx2/_lib/phase3b-route-matrix.ts",
  "app/api/hx2/_lib/phase3b-route-contract-summary.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts"
)

foreach ($Path in @($RequiredRoutes + $RequiredHelpers)) {
  if (!(Test-Path $Path)) {
    throw "Missing Phase 3B required file: $Path"
  }
}

Write-Host "PHASE 3B ROUTE EXISTENCE PREFLIGHT PASSED"




