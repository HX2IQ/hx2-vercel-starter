$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B ROUTE MATRIX COUNT GUARD =="

$MatrixPath = "app/api/hx2/_lib/phase3b-route-matrix.ts"

if (!(Test-Path $MatrixPath)) {
  throw "Missing route matrix helper: $MatrixPath"
}

$Matrix = Get-Content $MatrixPath -Raw

$RequiredRoutes = @(
  "/api/hx2/orchestration-compiler",
  "/api/hx2/orchestration-stage-dependencies",
  "/api/hx2/orchestration-stage-graph",
  "/api/hx2/orchestration-execution-plan",
  "/api/hx2/phase3b-orchestration-status",
  "/api/hx2/phase3b-release-manifest",
  "/api/hx2/phase3b-route-matrix",
  "/api/hx2/phase3b-route-contract-summary"
)

foreach ($Route in $RequiredRoutes) {
  if ($Matrix -notmatch [regex]::Escape($Route)) {
    throw "Route matrix missing required route: $Route"
  }
}

$RouteMatches = [regex]::Matches($Matrix, 'route:\s*"/api/hx2/')

if ($RouteMatches.Count -lt 8) {
  throw "Route matrix has too few routes: $($RouteMatches.Count)"
}

Write-Host "PHASE 3B ROUTE MATRIX COUNT GUARD PASSED"

