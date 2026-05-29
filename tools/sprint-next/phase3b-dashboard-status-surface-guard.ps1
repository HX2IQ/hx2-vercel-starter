$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD STATUS SURFACE GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-health-snapshot.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard status surface file: $File"
  }

  $Content = Get-Content $File -Raw

  $RequiredTerms = @(
    "dashboard:",
    "build_dashboard",
    "readonly_dashboard_guard",
    "latest_production_verify_summary"
  )

  foreach ($Term in $RequiredTerms) {
    if (-not $Content.Contains($Term)) {
      throw "Dashboard status surface missing term '$Term' in $File"
    }
  }
}

Write-Host "PHASE 3B DASHBOARD STATUS SURFACE GUARD PASSED"
