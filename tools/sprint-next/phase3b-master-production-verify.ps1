param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B MASTER PRODUCTION VERIFY =="

$RepoRoot = (Get-Location).Path
$StartedAtDate = Get-Date
$StartedAt = $StartedAtDate.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$VerifyDir = Join-Path $RepoRoot "tools/sprint-next/_audit"
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

$ProbePaths = foreach ($Probe in $Probes) {
  $FullPath = Join-Path $RepoRoot $Probe
  if (!(Test-Path $FullPath)) {
    throw "Missing production probe: $Probe"
  }
  $FullPath
}

Write-Host ""
Write-Host "== RUN PROBES IN PARALLEL =="

$Jobs = foreach ($ProbePath in $ProbePaths) {
  Start-Job -ScriptBlock {
    param($ProbePath, $Url, $RepoRoot)

    Set-Location $RepoRoot

    try {
      $Output = powershell -ExecutionPolicy Bypass -File $ProbePath -BaseUrl $Url 2>&1 | Out-String

      if ($LASTEXITCODE -ne 0) {
        throw $Output
      }

      [pscustomobject]@{
        probe = $ProbePath
        result = "passed"
        output = $Output
      }
    } catch {
      [pscustomobject]@{
        probe = $ProbePath
        result = "failed"
        output = $_.Exception.Message
      }
    }
  } -ArgumentList $ProbePath, $BaseUrl, $RepoRoot
}

Wait-Job $Jobs | Out-Null

$Results = foreach ($Job in $Jobs) {
  Receive-Job $Job
  Remove-Job $Job -Force
}

$Failures = @($Results | Where-Object { $_.result -ne "passed" })

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "== FAILED PROBES =="
  $Failures | ForEach-Object {
    Write-Host ""
    Write-Host "FAILED: $($_.probe)"
    Write-Host $_.output
  }

  throw "One or more Phase 3B production probes failed. Failure count: $($Failures.Count)"
}

$Summary = [ordered]@{
  audit_id = "phase3b-master-production-verify"
  started_at_utc = $StartedAt
  completed_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  duration_seconds = [math]::Round(((Get-Date) - $StartedAtDate).TotalSeconds, 2)
  base_url = $BaseUrl
  mode = "parallel_absolute_paths"
  probe_count = $ProbePaths.Count
  result = "passed"
  probes = $Results
}

$SummaryPath = Join-Path $VerifyDir ("phase3b-master-production-verify-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$Summary | ConvertTo-Json -Depth 10 | Set-Content $SummaryPath -Encoding UTF8

Write-Host ""
Write-Host "Production verify audit written: $SummaryPath"

Write-Host ""
Write-Host "PHASE 3B MASTER PRODUCTION VERIFY PASSED"

