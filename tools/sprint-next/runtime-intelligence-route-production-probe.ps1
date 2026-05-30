param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE =="

$Cases = @(
  @{
    name = "repeated_query"
    url = "$BaseUrl/api/hx2/runtime-intelligence-route?complexity=8&mission_critical=false&repeated_query=true"
    reasoning_depth = "light"
    execution_mode = "fast"
    orchestration_level = "single"
    cache_allowed = $true
  },
  @{
    name = "low_complexity"
    url = "$BaseUrl/api/hx2/runtime-intelligence-route?complexity=2&mission_critical=false&repeated_query=false"
    reasoning_depth = "light"
    execution_mode = "fast"
    orchestration_level = "single"
    cache_allowed = $true
  },
  @{
    name = "standard_complexity"
    url = "$BaseUrl/api/hx2/runtime-intelligence-route?complexity=5&mission_critical=false&repeated_query=false"
    reasoning_depth = "standard"
    execution_mode = "balanced"
    orchestration_level = "single"
    cache_allowed = $true
  },
  @{
    name = "mission_critical"
    url = "$BaseUrl/api/hx2/runtime-intelligence-route?complexity=4&mission_critical=true&repeated_query=false"
    reasoning_depth = "deep"
    execution_mode = "precision"
    orchestration_level = "multi"
    cache_allowed = $false
  },
  @{
    name = "deep_complexity"
    url = "$BaseUrl/api/hx2/runtime-intelligence-route?complexity=9&mission_critical=false&repeated_query=false"
    reasoning_depth = "deep"
    execution_mode = "precision"
    orchestration_level = "multi"
    cache_allowed = $false
  }
)

foreach ($Case in $Cases) {
  Write-Host ""
  Write-Host "Probe case: $($Case.name)"

  $Response = Invoke-RestMethod $Case.url

  if ($Response.ok -ne $true) { throw "Runtime intelligence route did not return ok=true for $($Case.name)" }
  if ($Response.mode -ne "read_only_runtime_intelligence_route") { throw "Runtime intelligence route mode mismatch for $($Case.name)" }
  if ($Response.mutation_allowed -ne $false) { throw "Runtime intelligence route must be read-only for $($Case.name)" }

  if ($Response.routing_decision.reasoning_depth -ne $Case.reasoning_depth) {
    throw "Runtime intelligence reasoning_depth mismatch for $($Case.name)"
  }

  if ($Response.routing_decision.execution_mode -ne $Case.execution_mode) {
    throw "Runtime intelligence execution_mode mismatch for $($Case.name)"
  }

  if ($Response.routing_decision.orchestration_level -ne $Case.orchestration_level) {
    throw "Runtime intelligence orchestration_level mismatch for $($Case.name)"
  }

  if ($Response.routing_decision.cache_allowed -ne $Case.cache_allowed) {
    throw "Runtime intelligence cache_allowed mismatch for $($Case.name)"
  }

  if ($Response.routing_decision.token_budget -lt 1000) {
    throw "Runtime intelligence token_budget too low for $($Case.name)"
  }
}

Write-Host ""
Write-Host "RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE PASSED"
