$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD DEPLOY MEMORY VISIBILITY GUARD =="

$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

if (!(Test-Path $DashboardPath)) {
  throw "Missing build dashboard"
}

$Dashboard = Get-Content $DashboardPath -Raw

$RequiredTerms = @(
  "LATEST AUTOMODE DEPLOY MEMORY",
  "phase3b-automode-deploy-memory.json",
  "Last execution mode:",
  "Last risk level:",
  "Last deploy skipped:",
  "Last adaptive score:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Dashboard.Contains($Term)) {
    throw "Dashboard deploy memory visibility missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD DEPLOY MEMORY VISIBILITY GUARD PASSED"
