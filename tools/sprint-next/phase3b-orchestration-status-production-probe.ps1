param(
  [string]$BaseUrl = "https://optinodeiq.com",
  [int]$Retries = 8,
  [int]$DelaySeconds = 20
)

$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B STATUS PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-orchestration-status"
$Response = $null
$LastError = $null

for ($Attempt = 1; $Attempt -le $Retries; $Attempt++) {
  try {
    Write-Host "Probe attempt $Attempt of $Retries`: $Url"
    $Response = Invoke-RestMethod -Uri $Url -Method GET
    break
  } catch {
    $LastError = $_.Exception.Message
    if ($Attempt -lt $Retries) {
      Start-Sleep -Seconds $DelaySeconds
    }
  }
}

if ($null -eq $Response) {
  throw "Phase 3B status production probe failed after $Retries attempts at $Url. Last error: $LastError"
}

$RequiredFields = @(
  "ok",
  "route",
  "phase",
  "status_id",
  "status_mode",
  "composition_mutation_allowed",
  "readiness",
  "compiler",
  "dependencies",
  "graph",
  "execution_plan"
)

foreach ($Field in $RequiredFields) {
  if (-not ($Response.PSObject.Properties.Name -contains $Field)) {
    throw "Phase 3B status response missing field: $Field"
  }
}

if ($Response.route -ne "/api/hx2/phase3b-orchestration-status") {
  throw "Phase 3B status route marker mismatch: $($Response.route)"
}

if ($Response.phase -ne "phase_3b") {
  throw "Phase 3B status phase mismatch: $($Response.phase)"
}

if ($Response.status_mode -ne "read_only_snapshot") {
  throw "Phase 3B status must remain read_only_snapshot"
}

if ($Response.composition_mutation_allowed -ne $false) {
  throw "Phase 3B status must report composition_mutation_allowed=false"
}

Write-Host "PHASE 3B STATUS PRODUCTION PROBE PASSED"
$Response | ConvertTo-Json -Depth 20
