param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B MASTER PRODUCTION VERIFY =="

$Probes = @(
  "tools/sprint-next/phase3b-build-health-production-probe.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1",
  "tools/sprint-next/phase3b-release-manifest-production-probe.ps1",
  "tools/sprint-next/phase3b-route-matrix-production-probe.ps1",
  "tools/sprint-next/phase3b-orchestration-status-production-probe.ps1"
)

foreach ($Probe in $Probes) {
  if (!(Test-Path $Probe)) {
    throw "Missing production probe: $Probe"
  }

  Write-Host ""
  Write-Host "== RUN PROBE: $Probe =="
  powershell -ExecutionPolicy Bypass -File $Probe -BaseUrl $BaseUrl
}

Write-Host ""
Write-Host "PHASE 3B MASTER PRODUCTION VERIFY PASSED"

