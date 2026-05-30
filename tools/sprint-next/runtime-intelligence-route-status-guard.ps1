$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RUNTIME INTELLIGENCE ROUTE STATUS GUARD =="

$ViewerPath = "tools/sprint-next/runtime-intelligence-route-status.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing runtime intelligence route status viewer"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "RUNTIME INTELLIGENCE ROUTE STATUS",
  "repeated_query",
  "low_complexity",
  "standard_complexity",
  "deep_complexity",
  "mission_critical",
  "routing_decision",
  "Token budget"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Viewer.Contains($Term)) {
    throw "Runtime intelligence route status viewer missing term: $Term"
  }
}

Write-Host "RUNTIME INTELLIGENCE ROUTE STATUS GUARD PASSED"
