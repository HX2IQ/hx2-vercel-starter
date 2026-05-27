$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD HEALTH GUARD =="

$HealthPath = "app/api/hx2/_lib/phase3b-build-health-snapshot.ts"
$RoutePath = "app/api/hx2/phase3b-build-health/route.ts"

foreach ($Path in @($HealthPath, $RoutePath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Health = Get-Content $HealthPath -Raw
$Route = Get-Content $RoutePath -Raw

$RequiredTerms = @(
  "hx2-phase3b-build-health",
  "read_only_build_health",
  "compiler_ready",
  "blocking_reasons",
  "planned_stage_count",
  "route_count"
)

foreach ($Term in $RequiredTerms) {
  if ($Health -notmatch [regex]::Escape($Term)) {
    throw "Build health snapshot missing required term: $Term"
  }
}

if ($Route -notmatch "/api/hx2/phase3b-build-health") {
  throw "Build health route missing canonical marker"
}

Write-Host "PHASE 3B BUILD HEALTH GUARD PASSED"
