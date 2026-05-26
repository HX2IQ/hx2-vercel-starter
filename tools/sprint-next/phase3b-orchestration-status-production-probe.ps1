param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B STATUS PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/phase3b-orchestration-status"

try {
  $Response = Invoke-RestMethod -Uri $Url -Method GET
} catch {
  throw "Phase 3B status production probe failed at $Url. $($_.Exception.Message)"
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

if (-not ($Response.readiness.PSObject.Properties.Name -contains "phase3b_ready")) {
  throw "Phase 3B readiness missing phase3b_ready"
}

if (-not ($Response.readiness.PSObject.Properties.Name -contains "blocking_reasons")) {
  throw "Phase 3B readiness missing blocking_reasons"
}

Write-Host "PHASE 3B STATUS PRODUCTION PROBE PASSED"

$Response | ConvertTo-Json -Depth 20
