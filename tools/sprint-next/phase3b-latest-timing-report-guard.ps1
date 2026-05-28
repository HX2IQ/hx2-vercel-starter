$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST TIMING REPORT GUARD =="

$ReportPath = "tools/sprint-next/phase3b-latest-timing-report.ps1"

if (!(Test-Path $ReportPath)) {
  throw "Missing latest timing report: $ReportPath"
}

$Report = Get-Content $ReportPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST TIMING REPORT",
  "duration_seconds",
  "started_at_utc",
  "completed_at_utc",
  "probe_count",
  "ConvertFrom-Json"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Report.Contains($Term)) {
    throw "Timing report missing required term: $Term"
  }
}

Write-Host "PHASE 3B LATEST TIMING REPORT GUARD PASSED"
