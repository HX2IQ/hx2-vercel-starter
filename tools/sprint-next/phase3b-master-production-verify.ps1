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

    $ProbeStartedAt = Get-Date

    try {
      $Output = powershell -ExecutionPolicy Bypass -File $ProbePath -BaseUrl $Url 2>&1 | Out-String
      $ProbeDuration = [math]::Round(((Get-Date) - $ProbeStartedAt).TotalSeconds, 2)

      if ($LASTEXITCODE -ne 0) {
        throw $Output
      }

      [pscustomobject]@{
        probe = $ProbePath
        result = "passed"
        duration_seconds = $ProbeDuration
        output = $Output
      }
    } catch {
      $ProbeDuration = [math]::Round(((Get-Date) - $ProbeStartedAt).TotalSeconds, 2)

      [pscustomobject]@{
        probe = $ProbePath
        result = "failed"
        duration_seconds = $ProbeDuration
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
  Write-Host "== SERIAL RETRY FAILED PROBES =="

  $RetryResults = @()

  foreach ($Failure in $Failures) {
    Write-Host ""
    Write-Host "Retrying: $($Failure.probe)"

    $RetryStartedAt = Get-Date

    try {
      $RetryOutput = powershell -ExecutionPolicy Bypass -File $Failure.probe -BaseUrl $BaseUrl 2>&1 | Out-String
      $RetryDuration = [math]::Round(((Get-Date) - $RetryStartedAt).TotalSeconds, 2)

      if ($LASTEXITCODE -ne 0) {
        throw $RetryOutput
      }

      $RetryResults += [pscustomobject]@{
        probe = $Failure.probe
        result = "passed_on_serial_retry"
        duration_seconds = $RetryDuration
        output = $RetryOutput
      }
    } catch {
      $RetryDuration = [math]::Round(((Get-Date) - $RetryStartedAt).TotalSeconds, 2)

      $RetryResults += [pscustomobject]@{
        probe = $Failure.probe
        result = "failed"
        duration_seconds = $RetryDuration
        output = $_.Exception.Message
      }
    }
  }

  $StillFailing = @($RetryResults | Where-Object { $_.result -eq "failed" })

  if ($StillFailing.Count -gt 0) {
    Write-Host ""
    Write-Host "== FAILED PROBES AFTER SERIAL RETRY =="

    $StillFailing | ForEach-Object {
      Write-Host ""
      Write-Host "FAILED: $($_.probe)"
      Write-Host $_.output
    }

    throw "One or more Phase 3B production probes failed after serial retry. Failure count: $($StillFailing.Count)"
  }

  $Results = @($Results | Where-Object { $_.result -eq "passed" }) + $RetryResults
}

$Summary = [ordered]@{
  audit_id = "phase3b-master-production-verify"
  started_at_utc = $StartedAt
  completed_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  duration_seconds = [math]::Round(((Get-Date) - $StartedAtDate).TotalSeconds, 2)
  base_url = $BaseUrl
  mode = "parallel_absolute_paths_with_serial_retry"
  probe_count = $ProbePaths.Count
  result = "passed"
  slowest_probes = @($Results | Sort-Object duration_seconds -Descending | Select-Object -First 3)
  probes = $Results
}

$SummaryPath = Join-Path $VerifyDir ("phase3b-master-production-verify-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$Summary | ConvertTo-Json -Depth 10 | Set-Content $SummaryPath -Encoding UTF8

Write-Host ""
Write-Host "Production verify audit written: $SummaryPath"

Write-Host ""
Write-Host "PHASE 3B MASTER PRODUCTION VERIFY PASSED"
