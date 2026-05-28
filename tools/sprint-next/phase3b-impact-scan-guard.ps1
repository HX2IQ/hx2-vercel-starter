$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B IMPACT SCAN GUARD =="

$Path = "tools/sprint-next/phase3b-impact-scan.ps1"

if (!(Test-Path $Path)) {
  throw "Missing impact scan script: $Path"
}

$Content = Get-Content $Path -Raw

$RequiredTerms = @(
  "PHASE 3B IMPACT SCAN",
  "git diff --name-only HEAD",
  "compiler",
  "graph",
  "routes",
  "probes",
  "guards",
  "build_process",
  "advisory only",
  "No validation is skipped",
  "Impact audit written",
  "phase3b-impact-scan",
  "validation_skipped",
  "risk_level",
  "high_risk_count",
  "medium_risk_count"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Content.Contains($Term)) {
    throw "Impact scan missing required term: $Term"
  }
}

Write-Host "PHASE 3B IMPACT SCAN GUARD PASSED"


