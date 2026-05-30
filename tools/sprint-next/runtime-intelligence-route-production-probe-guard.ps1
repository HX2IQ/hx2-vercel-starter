$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE GUARD =="

$ProbePath = "tools/sprint-next/runtime-intelligence-route-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing runtime intelligence route production probe"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "runtime-intelligence-route",
  "read_only_runtime_intelligence_route",
  "mutation_allowed",
  "reasoning_depth",
  "execution_mode",
  "token_budget"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Runtime intelligence route production probe missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTE PRODUCTION PROBE GUARD PASSED"
