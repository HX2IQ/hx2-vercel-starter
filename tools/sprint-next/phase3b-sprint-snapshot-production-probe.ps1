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
Write-Host "== PHASE 3B SPRINT SNAPSHOT PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-sprint-snapshot"
$Response = Invoke-WithRetry -Url $Url

if ($Response.ok -ne $true) { throw "Sprint snapshot did not return ok=true" }
if ($Response.route -ne "/api/hx2/phase3b-sprint-snapshot") { throw "Sprint snapshot route mismatch: $($Response.route)" }
if ($Response.snapshot_mode -ne "read_only_sprint_snapshot") { throw "Sprint snapshot mode mismatch: $($Response.snapshot_mode)" }
if ($Response.composition_mutation_allowed -ne $false) { throw "Sprint snapshot must report composition_mutation_allowed=false" }
if ($Response.route_contracts.route_count -lt 9) { throw "Sprint snapshot route count too low: $($Response.route_contracts.route_count)" }
if ($Response.orchestration.planned_stage_count -lt 1) { throw "Sprint snapshot planned_stage_count too low" }

if ($Response.speed_advisory.enabled -ne $true) { throw "Sprint snapshot speed_advisory not enabled" }
if ($Response.speed_advisory.validation_skipped -ne $false) { throw "Sprint snapshot must not skip validation" }
if ($Response.speed_advisory.cached_validation_advisory_only -ne $true) { throw "Sprint snapshot missing cached_validation_advisory_only" }
if ($Response.speed_advisory.impact_speed_decision_advisory -ne $true) { throw "Sprint snapshot missing impact_speed_decision_advisory" }

Write-Host ""
Write-Host "PHASE 3B SPRINT SNAPSHOT PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20

