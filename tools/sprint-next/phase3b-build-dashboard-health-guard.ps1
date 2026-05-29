$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD DASHBOARD HEALTH GUARD =="

$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

if (!(Test-Path $DashboardPath)) {
  throw "Missing build dashboard"
}

$Dashboard = Get-Content $DashboardPath -Raw

$RequiredTerms = @(
  "Dashboard health",
  "DashboardHealth",
  "healthy",
  "degraded",
  "Read-only dashboard: true"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Dashboard.Contains($Term)) {
    throw "Build dashboard health missing term: $Term"
  }
}

Write-Host "PHASE 3B BUILD DASHBOARD HEALTH GUARD PASSED"
