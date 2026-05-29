$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD HEALTH PROBE CONSOLIDATION GUARD =="

$VersionProbePath = "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"
$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

foreach ($Path in @($VersionProbePath, $VerifyPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$VersionProbe = Get-Content $VersionProbePath -Raw
$Verify = Get-Content $VerifyPath -Raw

if (-not $VersionProbe.Contains("dashboard_health")) {
  throw "Build-process version production probe must validate dashboard_health"
}

if ($Verify.Contains("phase3b-dashboard-health-production-probe.ps1")) {
  throw "Master verify should not run standalone dashboard health probe after consolidation"
}

Write-Host "PHASE 3B DASHBOARD HEALTH PROBE CONSOLIDATION GUARD PASSED"
