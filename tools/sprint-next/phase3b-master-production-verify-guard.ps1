$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B MASTER PRODUCTION VERIFY GUARD =="

$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

if (!(Test-Path $VerifyPath)) {
  throw "Missing master production verify script: $VerifyPath"
}

$Verify = Get-Content $VerifyPath -Raw

$RequiredProbes = @(
  "phase3b-build-health-full-production-probe.ps1",
  "phase3b-release-notes-production-probe.ps1",
  "phase3b-build-process-version-production-probe.ps1",
  "phase3b-sprint-snapshot-production-probe.ps1",
  "phase3b-route-matrix-production-probe.ps1",
  "phase3b-orchestration-status-production-probe.ps1"
)

foreach ($Probe in $RequiredProbes) {
  if (-not $Verify.Contains($Probe)) {
    throw "Master production verify missing required probe: $Probe"
  }
}

$DeprecatedProbes = @(
  "phase3b-build-health-production-probe.ps1",
  "phase3b-build-health-build-process-production-probe.ps1",
  "phase3b-build-health-source-contract-production-probe.ps1"
)

foreach ($Probe in $DeprecatedProbes) {
  if ($Verify.Contains($Probe)) {
    throw "Master production verify still contains deprecated probe: $Probe"
  }
}

Write-Host "PHASE 3B MASTER PRODUCTION VERIFY GUARD PASSED"
