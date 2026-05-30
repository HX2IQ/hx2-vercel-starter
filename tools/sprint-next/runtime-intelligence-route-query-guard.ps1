$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE QUERY GUARD =="

$RoutePath = "app/api/hx2/runtime-intelligence-route/route.ts"

if (!(Test-Path $RoutePath)) {
  throw "Missing runtime intelligence route"
}

$Route = Get-Content $RoutePath -Raw

$RequiredTerms = @(
  "NextRequest",
  "searchParams",
  "parseComplexity",
  "parseBoolean",
  "mission_critical",
  "repeated_query",
  "routing_decision",
  "mutation_allowed: false"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Route.Contains($Term)) {
    throw "Runtime intelligence route query support missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTE QUERY GUARD PASSED"
