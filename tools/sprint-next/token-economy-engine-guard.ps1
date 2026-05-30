$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== TOKEN ECONOMY ENGINE GUARD =="

$Files = @(
  "app/api/hx2/_lib/token-economy-engine.ts",
  "app/api/hx2/runtime-intelligence-route/route.ts"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing token economy file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "TokenEconomyProfile",
  "cost_pressure",
  "efficiency_mode",
  "escalation_allowed",
  "buildTokenEconomyProfile",
  "token_economy"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Token economy engine missing term: $Term"
  }
}

Write-Host "TOKEN ECONOMY ENGINE GUARD PASSED"
