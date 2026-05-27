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
Write-Host "== PHASE 3B BUILD HEALTH PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-build-health"
$Response = Invoke-WithRetry -Url $Url

if ($Response.ok -ne $true) { throw "Build health did not return ok=true" }
if ($Response.route -ne "/api/hx2/phase3b-build-health") { throw "Build health route mismatch: $($Response.route)" }
if ($Response.snapshot_mode -ne "read_only_build_health") { throw "Build health mode mismatch: $($Response.snapshot_mode)" }
if ($Response.composition_mutation_allowed -ne $false) { throw "Build health must report composition_mutation_allowed=false" }
if ($Response.health.route_count -lt 10) { throw "Build health route_count too low: $($Response.health.route_count)" }
if ($Response.health.planned_stage_count -lt 1) { throw "Build health planned_stage_count too low" }

Write-Host ""
Write-Host "PHASE 3B BUILD HEALTH PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20
