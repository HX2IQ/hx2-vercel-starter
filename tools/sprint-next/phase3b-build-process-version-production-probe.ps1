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

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS VERSION PRODUCTION PROBE =="
Write-Host "Expected process version: $ExpectedVersion"

$Url = "$BaseUrl/api/hx2/phase3b-build-process-version"
$Response = Invoke-WithRetry -Url $Url

if ($Response.ok -ne $true) { throw "Build process version did not return ok=true" }
if ($Response.route -ne "/api/hx2/phase3b-build-process-version") { throw "Build process version route mismatch: $($Response.route)" }
if ($Response.process_mode -ne "fast_safe_sprint") { throw "Build process mode mismatch: $($Response.process_mode)" }
if ($Response.process_version -ne $ExpectedVersion) { throw "Build process version mismatch. Expected $ExpectedVersion, got $($Response.process_version)" }
if ($Response.composition_mutation_allowed -ne $false) { throw "Build process version must report composition_mutation_allowed=false" }
if (-not ($Response.PSObject.Properties.Name -contains "release_notes")) { throw "Build process version missing release_notes" }
if ($Response.release_notes.Count -lt 3) { throw "Build process version release_notes too short" }

if ($Response.capabilities.skip_diff_summary -ne $true) { throw "Build process missing skip_diff_summary capability" }
if ($Response.capabilities.fast_no_review_mode -ne $true) { throw "Build process missing fast_no_review_mode capability" }
if ($Response.capabilities.parallel_production_verify -ne $true) { throw "Build process missing parallel_production_verify capability" }
if ($Response.capabilities.serial_retry_fallback -ne $true) { throw "Build process missing serial_retry_fallback capability" }
if ($Response.capabilities.latest_production_verify_summary -ne $true) { throw "Build process missing latest_production_verify_summary capability" }
if ($Response.capabilities.build_dashboard -ne $true) { throw "Build process missing build_dashboard capability" }
if ($Response.capabilities.dashboard_surface_consistency -ne $true) { throw "Build process missing dashboard_surface_consistency capability" }
if ($Response.capabilities.dashboard_capability_consistency -ne $true) { throw "Build process missing dashboard_capability_consistency capability" }
if ($Response.capabilities.readonly_dashboard_guard -ne $true) { throw "Build process missing readonly_dashboard_guard capability" }
if ($Response.capabilities.dashboard_health -ne $true) { throw "Build process missing dashboard_health capability" }
if ($Response.capabilities.production_probe_timing_summary -ne $true) { throw "Build process missing production_probe_timing_summary capability" }
if ($Response.capabilities.impact_speed_decision_advisory -ne $true) { throw "Build process missing impact_speed_decision_advisory capability" }
if ($Response.capabilities.cached_validation_advisory_only -ne $true) { throw "Build process missing cached_validation_advisory_only capability" }
if ($Response.capabilities.automode_usage_visibility -ne $true) { throw "Build process missing automode_usage_visibility capability" }
if ($Response.capabilities.latest_automode_decision_viewer -ne $true) { throw "Build process missing latest_automode_decision_viewer capability" }

Write-Host ""
Write-Host "PHASE 3B BUILD PROCESS VERSION PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20







