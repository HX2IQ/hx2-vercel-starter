param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE =="

$Response = Invoke-RestMethod "$BaseUrl/api/hx2/runtime-intelligence-route?complexity=9&mission_critical=true&repeated_query=false"

if ($Response.ok -ne $true) { throw "Runtime intelligence route did not return ok=true" }
if ($Response.mode -ne "read_only_runtime_intelligence_route") { throw "Runtime intelligence route mode mismatch" }
if ($Response.mutation_allowed -ne $false) { throw "Runtime intelligence route must be read-only" }

$RequiredRouterFields = @(
  "reasoning_depth",
  "execution_mode",
  "cache_allowed",
  "orchestration_level",
  "token_budget"
)

foreach ($Field in $RequiredRouterFields) {
  if (-not ($Response.routing_decision.PSObject.Properties.Name -contains $Field)) {
    throw "Runtime intelligence router missing field: $Field"
  }
}

if ($Response.routing_decision.reasoning_depth -ne "deep") {
  throw "Mission critical route should use deep reasoning"
}

if ($Response.routing_decision.execution_mode -ne "precision") {
  throw "Mission critical route should use precision execution"
}

if ($Response.routing_decision.orchestration_level -ne "multi") {
  throw "Mission critical route should use multi orchestration"
}

Write-Host "RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE PASSED"


