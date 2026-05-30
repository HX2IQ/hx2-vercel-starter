param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE STATUS =="

$Cases = @(
  @{ name="repeated_query"; url="$BaseUrl/api/hx2/runtime-intelligence-route?complexity=8&repeated_query=true" },
  @{ name="low_complexity"; url="$BaseUrl/api/hx2/runtime-intelligence-route?complexity=2" },
  @{ name="standard_complexity"; url="$BaseUrl/api/hx2/runtime-intelligence-route?complexity=5" },
  @{ name="deep_complexity"; url="$BaseUrl/api/hx2/runtime-intelligence-route?complexity=9" },
  @{ name="mission_critical"; url="$BaseUrl/api/hx2/runtime-intelligence-route?complexity=4&mission_critical=true" }
)

foreach ($Case in $Cases) {
  $Response = Invoke-RestMethod $Case.url
  $Decision = $Response.routing_decision

  Write-Host ""
  Write-Host "Case: $($Case.name)"
  Write-Host "Reasoning depth: $($Decision.reasoning_depth)"
  Write-Host "Execution mode: $($Decision.execution_mode)"
  Write-Host "Cache allowed: $($Decision.cache_allowed)"
  Write-Host "Orchestration level: $($Decision.orchestration_level)"
  Write-Host "Token budget: $($Decision.token_budget)"
  Write-Host "Economic priority: $($Response.token_economy.economic_priority)"
  Write-Host "Estimated cost units: $($Response.token_economy.estimated_cost_units)"
  Write-Host "Cost pressure: $($Response.token_economy.cost_pressure)"
}

