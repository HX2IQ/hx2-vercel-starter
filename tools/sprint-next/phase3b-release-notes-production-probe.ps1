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
$VersionSourcePath = "app/api/hx2/_lib/phase3b-build-process-version.ts"

if (!(Test-Path $VersionSourcePath)) {
  throw "Missing local version source: $VersionSourcePath"
}

$VersionSource = Get-Content $VersionSourcePath -Raw
$VersionMatch = [regex]::Match($VersionSource, 'process_version:\s*"([^"]+)"')

if (-not $VersionMatch.Success) {
  throw "Could not detect local process_version"
}

$ExpectedVersion = $VersionMatch.Groups[1].Value

Write-Host "== PHASE 3B RELEASE NOTES PRODUCTION PROBE =="
Write-Host "Expected process version: $ExpectedVersion"

Write-Host "Release manifest must pass its own production probe before release-notes alignment"
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-release-manifest-production-probe.ps1" -BaseUrl $BaseUrl

$Version = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-build-process-version"
$Health = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-build-health"
$Snapshot = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-sprint-snapshot"
$Manifest = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-release-manifest"

if ($Version.process_version -ne $ExpectedVersion) {
  throw "Build process version mismatch. Expected $ExpectedVersion, got $($Version.process_version)"
}

if ($Health.build_process.process_version -ne $ExpectedVersion) {
  throw "Build health version mismatch. Expected $ExpectedVersion, got $($Health.build_process.process_version)"
}

if ($Snapshot.build_process_version.process_version -ne $ExpectedVersion) {
  throw "Sprint snapshot version mismatch. Expected $ExpectedVersion, got $($Snapshot.build_process_version.process_version)"
}

if ($Manifest.build_process.process_version -ne $ExpectedVersion) {
  throw "Release manifest version mismatch. Expected $ExpectedVersion, got $($Manifest.build_process.process_version)"
}

$RequiredNotes = @(
  "Added fast no review mode",
  "Added skip diff summary mode",
  "Added sprint audit logs",
  "Added master production verification",
  "Added build health snapshot",
  "Added parallel production verification",
  "Added serial retry fallback for failed parallel probes",
  "Build process upgraded to 3b.3",
  "Added impact speed decision advisory",
  "Added cached validation advisory without skipping validation",
  "Exposed advisory speed layer in build health",
  "Exposed advisory speed layer in sprint snapshot",
  "Build process upgraded to 3b.4"
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











