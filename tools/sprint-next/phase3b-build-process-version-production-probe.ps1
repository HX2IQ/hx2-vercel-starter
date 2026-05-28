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
Write-Host "== PHASE 3B BUILD PROCESS VERSION PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-build-process-version"
$Response = Invoke-WithRetry -Url $Url

if ($Response.ok -ne $true) { throw "Build process version did not return ok=true" }
if ($Response.route -ne "/api/hx2/phase3b-build-process-version") { throw "Build process version route mismatch: $($Response.route)" }
if ($Response.process_mode -ne "fast_safe_sprint") { throw "Build process mode mismatch: $($Response.process_mode)" }
if ($Response.process_version -ne "3b.2") { throw "Build process version mismatch: $($Response.process_version)" }
if ($Response.composition_mutation_allowed -ne $false) { throw "Build process version must report composition_mutation_allowed=false" }
if (-not ($Response.PSObject.Properties.Name -contains "release_notes")) { throw "Build process version missing release_notes" }
if ($Response.release_notes.Count -lt 3) { throw "Build process version release_notes too short" }
if ($Response.capabilities.skip_diff_summary -ne $true) { throw "Build process missing skip_diff_summary capability" }
if ($Response.capabilities.fast_no_review_mode -ne $true) { throw "Build process missing fast_no_review_mode capability" }
if ($Response.capabilities.parallel_production_verify -ne $true) { throw "Build process missing parallel_production_verify capability" }
if ($Response.capabilities.serial_retry_fallback -ne $true) { throw "Build process missing serial_retry_fallback capability" }

Write-Host ""
Write-Host "PHASE 3B BUILD PROCESS VERSION PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20




