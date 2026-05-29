$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD HEALTH CONSOLIDATION CLEANUP GUARD =="

$ClosurePath = "tools/sprint-next/phase3b-sprint-closure.ps1"
$VersionProbePath = "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"
$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

foreach ($Path in @($ClosurePath, $VersionProbePath, $VerifyPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Closure = Get-Content $ClosurePath -Raw
$VersionProbe = Get-Content $VersionProbePath -Raw
$Verify = Get-Content $VerifyPath -Raw

if ($Closure.Contains("phase3b-dashboard-health-production-probe-guard.ps1")) {
  throw "Closure still references deprecated standalone dashboard health production probe guard"
}

if ($Verify.Contains("phase3b-dashboard-health-production-probe.ps1")) {
  throw "Master verify still references deprecated standalone dashboard health production probe"
}

if (-not $VersionProbe.Contains("dashboard_health")) {
  throw "Build-process version production probe must validate dashboard_health after consolidation"
}

Write-Host "PHASE 3B DASHBOARD HEALTH CONSOLIDATION CLEANUP GUARD PASSED"
