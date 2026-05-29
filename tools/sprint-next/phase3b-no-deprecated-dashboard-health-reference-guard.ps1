$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B NO DEPRECATED DASHBOARD HEALTH REFERENCE GUARD =="

$Deprecated = "phase3b-dashboard-health-production-probe.ps1"

$Matches = Get-ChildItem "tools/sprint-next" -Recurse -File -Include *.ps1 |
  Where-Object { $_.FullName -notlike "*phase3b-no-deprecated-dashboard-health-reference-guard.ps1" } |
  Select-String -Pattern $Deprecated -SimpleMatch

if ($Matches) {
  $Matches | Select-Object Path, LineNumber, Line | Format-List
  throw "Deprecated dashboard health production probe reference still exists"
}

$VersionProbePath = "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"

if (!(Test-Path $VersionProbePath)) {
  throw "Missing consolidated build-process version production probe"
}

$VersionProbe = Get-Content $VersionProbePath -Raw

if (-not $VersionProbe.Contains("dashboard_health")) {
  throw "Consolidated version probe must validate dashboard_health"
}

Write-Host "PHASE 3B NO DEPRECATED DASHBOARD HEALTH REFERENCE GUARD PASSED"
