param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B MASTER PRODUCTION VERIFY =="

$StartedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$VerifyDir = "tools/sprint-next/_audit"
New-Item -ItemType Directory -Force -Path $VerifyDir | Out-Null

$Probes = @(
  "tools/sprint-next/phase3b-build-health-full-production-probe.ps1",
  "tools/sprint-next/phase3b-release-notes-production-probe.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1",
  "tools/sprint-next/phase3b-release-manifest-production-probe.ps1",
  "tools/sprint-next/phase3b-route-matrix-production-probe.ps1",
  "tools/sprint-next/phase3b-orchestration-status-production-probe.ps1"
)

$Results = @()

foreach ($Probe in $Probes) {
  if (!(Test-Path $Probe)) {
    throw "Missing production probe: $Probe"
  }

  Write-Host ""
  Write-Host "== RUN PROBE: $Probe =="

  powershell -ExecutionPolicy Bypass -File $Probe -BaseUrl $BaseUrl

  $Results += [ordered]@{
    probe = $Probe
    result = "passed"
  }
}

$Summary = [ordered]@{
  audit_id = "phase3b-master-production-verify"
  started_at_utc = $StartedAt
  completed_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  base_url = $BaseUrl
  probe_count = $Probes.Count
  result = "passed"
  probes = $Results
}

$SummaryPath = Join-Path $VerifyDir ("phase3b-master-production-verify-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$Summary | ConvertTo-Json -Depth 10 | Set-Content $SummaryPath -Encoding UTF8

Write-Host ""
Write-Host "Production verify audit written: $SummaryPath"

Write-Host ""
Write-Host "PHASE 3B MASTER PRODUCTION VERIFY PASSED"
