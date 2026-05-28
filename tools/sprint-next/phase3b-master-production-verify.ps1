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

foreach ($Probe in $Probes) {
  if (!(Test-Path $Probe)) {
    throw "Missing production probe: $Probe"
  }
}

Write-Host ""
Write-Host "== RUN PROBES IN PARALLEL =="

$Jobs = foreach ($Probe in $Probes) {
  Start-Job -ScriptBlock {
    param($ProbePath, $Url)

    powershell -ExecutionPolicy Bypass -File $ProbePath -BaseUrl $Url

    [ordered]@{
      probe = $ProbePath
      result = "passed"
    }
  } -ArgumentList $Probe, $BaseUrl
}

$Results = @()
$Failures = @()

foreach ($Job in $Jobs) {
  Wait-Job $Job | Out-Null

  if ($Job.State -eq "Failed") {
    $Failures += $Job
  } else {
    try {
      $Output = Receive-Job $Job -ErrorAction Stop
      $Results += $Output | Where-Object { $_ -is [System.Collections.Specialized.OrderedDictionary] }
    } catch {
      $Failures += $Job
    }
  }

  Remove-Job $Job -Force
}

if ($Failures.Count -gt 0) {
  throw "One or more Phase 3B production probes failed. Failure count: $($Failures.Count)"
}

$Summary = [ordered]@{
  audit_id = "phase3b-master-production-verify"
  started_at_utc = $StartedAt
  completed_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  base_url = $BaseUrl
  mode = "parallel"
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
