$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD DASHBOARD RUNTIME METADATA GUARD =="

$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

if (!(Test-Path $DashboardPath)) {
  throw "Missing build dashboard"
}

$Dashboard = Get-Content $DashboardPath -Raw

$RequiredTerms = @(
  "Dashboard version",
  "Generated UTC",
  "GeneratedUtc",
  "Read-only dashboard: true",
  "DashboardVersion = `"1.1`""
)

foreach ($Term in $RequiredTerms) {
  if (-not $Dashboard.Contains($Term)) {
    throw "Build dashboard runtime metadata missing term: $Term"
  }
}

Write-Host "PHASE 3B BUILD DASHBOARD RUNTIME METADATA GUARD PASSED"
