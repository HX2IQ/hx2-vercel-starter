param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE =="

$Response = Invoke-RestMethod "$BaseUrl/api/hx2/runtime-intelligence-route"

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
  if (-not ($Response.router.PSObject.Properties.Name -contains $Field)) {
    throw "Runtime intelligence router missing field: $Field"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE PASSED"
