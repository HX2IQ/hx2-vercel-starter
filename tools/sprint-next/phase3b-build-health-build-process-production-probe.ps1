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
Write-Host "== PHASE 3B BUILD HEALTH BUILD PROCESS PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-build-health"
$Response = Invoke-WithRetry -Url $Url

if ($Response.build_process.process_mode -ne "fast_safe_sprint") {
  throw "Build health process_mode mismatch: $($Response.build_process.process_mode)"
}

if ($Response.build_process.process_version -ne "3b.1") {
  throw "Build health process_version mismatch: $($Response.build_process.process_version)"
}

if ($Response.build_process.capabilities.fast_safe_runner -ne $true) {
  throw "Build health missing fast_safe_runner capability"
}

if ($Response.build_process.capabilities.master_production_verify -ne $true) {
  throw "Build health missing master_production_verify capability"
}

Write-Host ""
Write-Host "PHASE 3B BUILD HEALTH BUILD PROCESS PRODUCTION PROBE PASSED"
