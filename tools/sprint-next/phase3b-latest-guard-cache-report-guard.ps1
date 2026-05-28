$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST GUARD CACHE REPORT GUARD =="

$ReportPath = "tools/sprint-next/phase3b-latest-guard-cache-report.ps1"

if (!(Test-Path $ReportPath)) {
  throw "Missing guard cache report: $ReportPath"
}

$Report = Get-Content $ReportPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST GUARD CACHE REPORT",
  "phase3b-guard-cache.json",
  "changed_count",
  "unchanged_count",
  "informational only",
  "No validation is skipped"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Report.Contains($Term)) {
    throw "Guard cache report missing required term: $Term"
  }
}

Write-Host "PHASE 3B LATEST GUARD CACHE REPORT GUARD PASSED"
