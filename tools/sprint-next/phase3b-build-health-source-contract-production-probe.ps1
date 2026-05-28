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
Write-Host "== PHASE 3B BUILD HEALTH SOURCE CONTRACT PRODUCTION PROBE =="

$Response = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-build-health"

$RequiredBuildProcessFields = @(
  "process_mode",
  "process_version",
  "release_notes",
  "capabilities"
)

foreach ($Field in $RequiredBuildProcessFields) {
  if (-not ($Response.build_process.PSObject.Properties.Name -contains $Field)) {
    throw "Build health build_process missing field: $Field"
  }
}

if ($Response.build_process.process_mode -ne "fast_safe_sprint") {
  throw "Build health build_process process_mode mismatch: $($Response.build_process.process_mode)"
}

if ($Response.build_process.process_version -ne "3b.2") {
  throw "Build health build_process process_version mismatch: $($Response.build_process.process_version)"
}

if ($Response.build_process.release_notes.Count -lt 3) {
  throw "Build health build_process release_notes too short"
}

Write-Host ""
Write-Host "PHASE 3B BUILD HEALTH SOURCE CONTRACT PRODUCTION PROBE PASSED"
