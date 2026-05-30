$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE MATRIX PROBE GUARD =="

$ProbePath = "tools/sprint-next/runtime-intelligence-route-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing runtime intelligence production probe"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "repeated_query",
  "low_complexity",
  "standard_complexity",
  "mission_critical",
  "deep_complexity",
  "reasoning_depth",
  "execution_mode",
  "orchestration_level",
  "cache_allowed",
  "token_budget"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Runtime intelligence matrix probe missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTE MATRIX PROBE GUARD PASSED"
