$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B ROUTE MATRIX GUARD =="

$MatrixPath = "app/api/hx2/_lib/phase3b-route-matrix.ts"
$RoutePath = "app/api/hx2/phase3b-route-matrix/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($MatrixPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Matrix = Get-Content $MatrixPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getPhase3BRouteMatrix",
  "hx2-phase3b-route-matrix",
  "read_only_contract",
  "composition_mutation_allowed: false",
  "orchestration-compiler",
  "orchestration-stage-dependencies",
  "orchestration-stage-graph",
  "orchestration-execution-plan",
  "phase3b-orchestration-status",
  "phase3b-release-manifest"
)

foreach ($Term in $RequiredTerms) {
  if ($Matrix -notmatch [regex]::Escape($Term)) {
    throw "Phase 3B route matrix missing required term: $Term"
  }
}

if ($Matrix -match "sprint-next-composition") {
  throw "Route matrix must not import sprint-next-composition"
}

if ($Composition -match "phase3b-route-matrix") {
  throw "Composition must not reference route matrix during preview phase"
}

if ($Route -notmatch "/api/hx2/phase3b-route-matrix") {
  throw "Route matrix route missing canonical marker"
}

Write-Host "PHASE 3B ROUTE MATRIX GUARD PASSED"
