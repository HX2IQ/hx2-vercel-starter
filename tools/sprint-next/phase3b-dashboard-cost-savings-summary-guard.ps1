$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD COST SAVINGS SUMMARY GUARD =="

$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

if (!(Test-Path $DashboardPath)) {
  throw "Missing build dashboard"
}

$Dashboard = Get-Content $DashboardPath -Raw

$RequiredTerms = @(
  "AUTO MODE COST SAVINGS SUMMARY",
  "Estimated Vercel savings:",
  "Estimated VPS savings:",
  "Latest sprint avoided production deployment",
  "Latest sprint executed full deployment"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Dashboard.Contains($Term)) {
    throw "Dashboard cost savings summary missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD COST SAVINGS SUMMARY GUARD PASSED"
