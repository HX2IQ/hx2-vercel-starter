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

if (-not ($Response.PSObject.Properties.Name -contains "build_process")) {
  throw "Release manifest missing build_process"
}

if (-not ($Response.build_process.PSObject.Properties.Name -contains "process_version")) {
  throw "Release manifest build_process missing process_version"
}

if ([string]::IsNullOrWhiteSpace($Response.build_process.process_version)) {
  throw "Release manifest build_process process_version is blank"
}

if (-not ($Response.build_process.PSObject.Properties.Name -contains "release_notes")) {
  throw "Release manifest build_process missing release_notes"
}

if ($Response.build_process.release_notes.Count -lt 3) {
  throw "Release manifest build_process release_notes too short"
}

if ($Response.dashboard.enabled -ne $true) { throw "Release manifest dashboard not enabled" }
if ($Response.dashboard.readonly_guard -ne $true) { throw "Release manifest dashboard readonly_guard missing" }
if ($Response.dashboard.latest_production_verify_summary -ne $true) { throw "Release manifest dashboard latest_production_verify_summary missing" }

if (-not ($Response.summary.PSObject.Properties.Name -contains "planned_stage_count")) {
  throw "Release manifest summary missing planned_stage_count"
}

Write-Host ""
Write-Host "PHASE 3B RELEASE MANIFEST PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20


