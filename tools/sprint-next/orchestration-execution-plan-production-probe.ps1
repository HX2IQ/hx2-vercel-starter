param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION EXECUTION PLAN PRODUCTION PROBE =="

$Url = "$BaseUrl/api/hx2/orchestration-execution-plan"

try {
  $Response = Invoke-RestMethod -Uri $Url -Method GET
} catch {
  throw "Execution plan production probe failed at $Url. $($_.Exception.Message)"
}

$RequiredFields = @(
  "ok",
  "route",
  "plan_id",
  "plan_phase",
  "plan_mode",
  "composition_mutation_allowed",
  "execution_ready",
  "blocking_reasons",
  "planned_stage_count",
  "planned_stages",
  "graph_summary"
)

foreach ($Field in $RequiredFields) {
  if (-not ($Response.PSObject.Properties.Name -contains $Field)) {
    throw "Execution plan response missing field: $Field"
  }
}

if ($Response.route -ne "/api/hx2/orchestration-execution-plan") {
  throw "Execution plan route marker mismatch: $($Response.route)"
}

if ($Response.plan_mode -ne "read_only_preview") {
  throw "Execution plan must remain read_only_preview"
}

if ($Response.composition_mutation_allowed -ne $false) {
  throw "Execution plan must report composition_mutation_allowed=false"
}

if ($Response.planned_stage_count -lt 1) {
  throw "Execution plan has no planned stages"
}

if (-not ($Response.graph_summary.PSObject.Properties.Name -contains "topological_plan")) {
  throw "Execution plan graph summary missing topological_plan"
}

Write-Host "ORCHESTRATION EXECUTION PLAN PRODUCTION PROBE PASSED"

$Response | ConvertTo-Json -Depth 20
