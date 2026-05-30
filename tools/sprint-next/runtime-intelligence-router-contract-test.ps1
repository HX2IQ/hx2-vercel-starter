$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTER CONTRACT TEST =="

$RoutePath = "app/api/hx2/_lib/runtime-intelligence-router.ts"

if (!(Test-Path $RoutePath)) {
  throw "Missing runtime intelligence router"
}

$Router = Get-Content $RoutePath -Raw

$RequiredBranches = @(
  "input.repeated_query",
  "input.mission_critical",
  "complexity <= 3",
  "complexity <= 7",
  "reasoning_depth: `"deep`"",
  "execution_mode: `"precision`"",
  "cache_allowed: false",
  "orchestration_level: `"multi`"",
  "token_budget"
)

foreach ($Term in $RequiredBranches) {
  if (-not $Router.Contains($Term)) {
    throw "Runtime intelligence router missing contract branch: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTER CONTRACT TEST PASSED"
