$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE GUARD =="

$RoutePath = "app/api/hx2/runtime-intelligence-route/route.ts"

if (!(Test-Path $RoutePath)) {
  throw "Missing runtime intelligence route"
}

$Route = Get-Content $RoutePath -Raw

$RequiredTerms = @(
  "routeRuntimeIntelligence",
  "read_only_runtime_intelligence_route",
  "mutation_allowed: false",
  "complexity_score",
  "NextResponse.json"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Route.Contains($Term)) {
    throw "Runtime intelligence route missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTE GUARD PASSED"
