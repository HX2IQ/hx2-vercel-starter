$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD DASHBOARD READONLY GUARD =="

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
    throw "Build dashboard missing read-only viewer term: $Term"
  }
}

$ForbiddenTerms = @(
  "git commit",
  "git push",
  "npm run build",
  "vercel --prod",
  "phase3b-sprint-closure.ps1",
  "phase3b-master-production-verify.ps1"
)

foreach ($Term in $ForbiddenTerms) {
  if ($Dashboard.Contains($Term)) {
    throw "Build dashboard must remain read-only. Forbidden term found: $Term"
  }
}

Write-Host "PHASE 3B BUILD DASHBOARD READONLY GUARD PASSED"
