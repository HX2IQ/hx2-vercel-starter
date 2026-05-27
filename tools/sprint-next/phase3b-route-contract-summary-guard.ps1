$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B ROUTE CONTRACT SUMMARY GUARD =="

$SummaryPath = "app/api/hx2/_lib/phase3b-route-contract-summary.ts"
$RoutePath = "app/api/hx2/phase3b-route-contract-summary/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($SummaryPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Summary = Get-Content $SummaryPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getPhase3BRouteContractSummary",
  "hx2-phase3b-route-contract-summary",
  "read_only_contract_summary",
  "composition_mutation_allowed: false",
  "route_count",
  "contracts",
  "expected_mode",
  "build_health"
)

foreach ($Term in $RequiredTerms) {
  if ($Summary -notmatch [regex]::Escape($Term)) {
    throw "Route contract summary missing required term: $Term"
  }
}

if ($Summary -match "sprint-next-composition") {
  throw "Route contract summary must not import sprint-next-composition"
}

if ($Composition -match "phase3b-route-contract-summary") {
  throw "Composition must not reference route contract summary during preview phase"
}

if ($Route -notmatch "/api/hx2/phase3b-route-contract-summary") {
  throw "Route contract summary route missing canonical marker"
}

Write-Host "PHASE 3B ROUTE CONTRACT SUMMARY GUARD PASSED"

