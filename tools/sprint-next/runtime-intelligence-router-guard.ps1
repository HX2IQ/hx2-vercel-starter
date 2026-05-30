$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTER GUARD =="

$RouterPath = "app/api/hx2/_lib/runtime-intelligence-router.ts"

if (!(Test-Path $RouterPath)) {
  throw "Missing runtime intelligence router"
}

$Router = Get-Content $RouterPath -Raw

$RequiredTerms = @(
  "reasoning_depth",
  "execution_mode",
  "cache_allowed",
  "orchestration_level",
  "token_budget",
  "mission_critical",
  "repeated_query"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Router.Contains($Term)) {
    throw "Runtime intelligence router missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTER GUARD PASSED"
