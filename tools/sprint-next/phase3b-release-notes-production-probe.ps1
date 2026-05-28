param(
  [string]$BaseUrl = "https://optinodeiq.com",
  [int]$Retries = 6,
  [int]$DelaySeconds = 15
)

$ErrorActionPreference = "Stop"

function Invoke-WithRetry {
  param([string]$Url)

  for ($Attempt = 1; $Attempt -le $Retries; $Attempt++) {
    try {
      Write-Host "Probe attempt $Attempt of $Retries`: $Url"
      return Invoke-RestMethod $Url
    } catch {
      if ($Attempt -eq $Retries) {
        throw "Probe failed after $Retries attempts: $Url. Last error: $($_.Exception.Message)"
      }
      Start-Sleep -Seconds $DelaySeconds
    }
  }
}

Write-Host ""
Write-Host "== PHASE 3B RELEASE NOTES PRODUCTION PROBE =="

$Version = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-build-process-version"
$Health = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-build-health"
$Snapshot = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-sprint-snapshot"

$RequiredNotes = @(
  "Added fast no review mode",
  "Added skip diff summary mode",
  "Added sprint audit logs",
  "Added master production verification",
  "Added build health snapshot"
)

foreach ($Note in $RequiredNotes) {
  if ($Version.release_notes -notcontains $Note) {
    throw "Build process version missing release note: $Note"
  }

  if ($Health.build_process.release_notes -notcontains $Note) {
    throw "Build health missing release note: $Note"
  }

  if ($Snapshot.build_process_version.release_notes -notcontains $Note) {
    throw "Sprint snapshot missing release note: $Note"
  }
}

Write-Host ""
Write-Host "PHASE 3B RELEASE NOTES PRODUCTION PROBE PASSED"
