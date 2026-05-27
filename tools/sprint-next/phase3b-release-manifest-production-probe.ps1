param(
  [string]$BaseUrl = "https://optinodeiq.com",
  [int]$Retries = 6,
  [int]$DelaySeconds = 15
)

$ErrorActionPreference = "Stop"

function Invoke-WithRetry {
  param([string]$Url)

  $LastError = $null

  for ($Attempt = 1; $Attempt -le $Retries; $Attempt++) {
    try {
      Write-Host "Probe attempt $Attempt of $Retries`: $Url"
      return Invoke-RestMethod $Url
    } catch {
      $LastError = $_.Exception.Message
      if ($Attempt -lt $Retries) {
        Start-Sleep -Seconds $DelaySeconds
      }
    }
  }

  throw "Probe failed after $Retries attempts: $Url. Last error: $LastError"
}

Write-Host ""
Write-Host "== PHASE 3B RELEASE MANIFEST PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-release-manifest"
$Response = Invoke-WithRetry -Url $Url

if ($Response.ok -ne $true) {
  throw "Release manifest did not return ok=true"
}

if ($Response.route -ne "/api/hx2/phase3b-release-manifest") {
  throw "Release manifest route marker mismatch: $($Response.route)"
}

if ($Response.release_mode -ne "deterministic_orchestration_preview") {
  throw "Release manifest mode mismatch: $($Response.release_mode)"
}

if (-not ($Response.PSObject.Properties.Name -contains "route_matrix")) {
  throw "Release manifest missing route_matrix"
}

if ($Response.route_matrix.route_count -lt 7) {
  throw "Release manifest route matrix route_count too low: $($Response.route_matrix.route_count)"
}

if ($Response.route_matrix.matrix_mode -ne "read_only_contract") {
  throw "Release manifest route matrix mode mismatch: $($Response.route_matrix.matrix_mode)"
}

if (-not ($Response.summary.PSObject.Properties.Name -contains "planned_stage_count")) {
  throw "Release manifest summary missing planned_stage_count"
}

Write-Host ""
Write-Host "PHASE 3B RELEASE MANIFEST PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20
