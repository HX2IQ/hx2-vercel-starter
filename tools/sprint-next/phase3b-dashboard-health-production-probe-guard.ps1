$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD HEALTH PRODUCTION PROBE GUARD =="

$ProbePath = "tools/sprint-next/phase3b-dashboard-health-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing dashboard health production probe"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "dashboard_health",
  "phase3b-build-process-version",
  "Production build-process version missing dashboard_health capability"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Dashboard health production probe missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD HEALTH PRODUCTION PROBE GUARD PASSED"
