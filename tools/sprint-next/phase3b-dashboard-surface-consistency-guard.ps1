$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD SURFACE CONSISTENCY GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-release-manifest.ts",
  "app/api/hx2/_lib/phase3b-build-health-snapshot.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts",
  "tools/sprint-next/phase3b-release-manifest-production-probe.ps1",
  "tools/sprint-next/phase3b-build-health-full-production-probe.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard consistency file: $File"
  }

  $Content = Get-Content $File -Raw

  $RequiredTerms = @(
    "dashboard",
    "readonly_guard",
    "latest_production_verify_summary"
  )

  foreach ($Term in $RequiredTerms) {
    if (-not $Content.Contains($Term)) {
      throw "Dashboard surface missing term '$Term' in $File"
    }
  }
}

Write-Host "PHASE 3B DASHBOARD SURFACE CONSISTENCY GUARD PASSED"
