$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ECONOMIC PRESSURE GUARD =="

$EconomyPath = "app/api/hx2/_lib/token-economy-engine.ts"

if (!(Test-Path $EconomyPath)) {
  throw "Missing token economy engine"
}

$Economy = Get-Content $EconomyPath -Raw

$RequiredTerms = @(
  "estimated_cost_units",
  "economic_priority",
  "efficiency",
  "balanced",
  "quality",
  "cost_pressure"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Economy.Contains($Term)) {
    throw "Economic pressure engine missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ECONOMIC PRESSURE GUARD PASSED"
