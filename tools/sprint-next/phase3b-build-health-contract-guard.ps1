$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD HEALTH CONTRACT GUARD =="

$HealthPath = "app/api/hx2/_lib/phase3b-build-health-snapshot.ts"

if (!(Test-Path $HealthPath)) {
  throw "Missing build health helper: $HealthPath"
}

$Health = Get-Content $HealthPath -Raw

$RequiredTerms = @(
  "getPhase3BBuildHealthSnapshot",
  "read_only_build_health",
  "phase3b_ready",
  "blocking_reasons",
  "route_count",
  "planned_stage_count"
)

foreach ($Term in $RequiredTerms) {
  if ($Health -notmatch [regex]::Escape($Term)) {
    throw "Build health contract missing required term: $Term"
  }
}

if ($Health -match "manifest\.readiness\.compiler_ready") {
  throw "Build health must not reference manifest.readiness.compiler_ready"
}

Write-Host "PHASE 3B BUILD HEALTH CONTRACT GUARD PASSED"
