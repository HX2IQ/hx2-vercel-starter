$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD HEALTH DEPRECATED FILE GUARD =="

$DeprecatedProbePath = "tools/sprint-next/phase3b-dashboard-health-production-probe.ps1"
$VersionProbePath = "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"

if (Test-Path $DeprecatedProbePath) {
  throw "Deprecated standalone dashboard health production probe still exists"
}

if (!(Test-Path $VersionProbePath)) {
  throw "Missing build-process version production probe"
}

$VersionProbe = Get-Content $VersionProbePath -Raw

if (-not $VersionProbe.Contains("dashboard_health")) {
  throw "Consolidated build-process version probe must validate dashboard_health"
}

Write-Host "PHASE 3B DASHBOARD HEALTH DEPRECATED FILE GUARD PASSED"
