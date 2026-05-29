$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD PRODUCTION SURFACE GUARD =="

$Files = @(
  "tools/sprint-next/phase3b-build-health-full-production-probe.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard production surface file: $File"
  }

  $Content = Get-Content $File -Raw

  $RequiredTerms = @(
    "dashboard.enabled",
    "dashboard.readonly_guard",
    "dashboard.latest_production_verify_summary"
  )

  foreach ($Term in $RequiredTerms) {
    if (-not $Content.Contains($Term)) {
      throw "Dashboard production surface missing term '$Term' in $File"
    }
  }
}

Write-Host "PHASE 3B DASHBOARD PRODUCTION SURFACE GUARD PASSED"
