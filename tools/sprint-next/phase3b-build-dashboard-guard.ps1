$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD DASHBOARD GUARD =="

$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

if (!(Test-Path $DashboardPath)) {
  throw "Missing build dashboard"
}

$Dashboard = Get-Content $DashboardPath -Raw

$RequiredTerms = @(
  "PHASE 3B BUILD DASHBOARD",
  "phase3b-version-status.ps1",
  "phase3b-latest-audit.ps1",
  "phase3b-latest-timing-report.ps1",
  "phase3b-latest-impact-report.ps1",
  "phase3b-latest-speed-decision.ps1",
  "phase3b-latest-production-verify-summary.ps1"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Dashboard.Contains($Term)) {
    throw "Build dashboard missing term: $Term"
  }
}

Write-Host "PHASE 3B BUILD DASHBOARD GUARD PASSED"
