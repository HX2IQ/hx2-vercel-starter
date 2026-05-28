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
Write-Host "== PHASE 3B BUILD HEALTH FULL PRODUCTION PROBE =="

$Response = Invoke-WithRetry -Url "$BaseUrl/api/hx2/phase3b-build-health"

if ($Response.ok -ne $true) { throw "Build health did not return ok=true" }
if ($Response.route -ne "/api/hx2/phase3b-build-health") { throw "Build health route mismatch: $($Response.route)" }
if ($Response.snapshot_mode -ne "read_only_build_health") { throw "Build health snapshot_mode mismatch: $($Response.snapshot_mode)" }
if ($Response.phase -ne "phase_3b") { throw "Build health phase mismatch: $($Response.phase)" }
if ($Response.composition_mutation_allowed -ne $false) { throw "Build health must report composition_mutation_allowed=false" }

if ($Response.build_process.process_mode -ne "fast_safe_sprint") { throw "Build health process_mode mismatch" }
if ($Response.build_process.process_version -ne "3b.3") { throw "Build health process_version mismatch" }
if ($Response.build_process.release_notes.Count -lt 3) { throw "Build health release_notes too short" }

if ($Response.health.route_count -lt 10) { throw "Build health route_count too low: $($Response.health.route_count)" }
if ($Response.health.planned_stage_count -lt 1) { throw "Build health planned_stage_count too low" }

if ($Response.speed_advisory.enabled -ne $true) { throw "Build health speed_advisory not enabled" }
if ($Response.speed_advisory.validation_skipped -ne $false) { throw "Build health must not skip validation" }
if ($Response.speed_advisory.cached_validation_advisory_only -ne $true) { throw "Build health missing cached_validation_advisory_only" }
if ($Response.speed_advisory.impact_speed_decision_advisory -ne $true) { throw "Build health missing impact_speed_decision_advisory" }

Write-Host ""
Write-Host "PHASE 3B BUILD HEALTH FULL PRODUCTION PROBE PASSED"


