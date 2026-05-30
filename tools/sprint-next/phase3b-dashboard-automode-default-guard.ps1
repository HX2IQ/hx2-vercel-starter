$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD AUTOMODE DEFAULT GUARD =="

$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

if (!(Test-Path $DashboardPath)) {
  throw "Missing build dashboard"
}

$Dashboard = Get-Content $DashboardPath -Raw

$RequiredTerms = @(
  "AutoMode default: true",
  "Cost-saving strategy: active",
  "Read-only dashboard: true"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Dashboard.Contains($Term)) {
    throw "Dashboard AutoMode default missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD AUTOMODE DEFAULT GUARD PASSED"
