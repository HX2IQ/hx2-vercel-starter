$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD MANIFEST SURFACE GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-release-manifest.ts",
  "tools/sprint-next/phase3b-release-manifest-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard manifest surface file: $File"
  }

  $Content = Get-Content $File -Raw

  $RequiredTerms = @(
    "dashboard",
    "readonly_guard",
    "latest_production_verify_summary"
  )

  foreach ($Term in $RequiredTerms) {
    if (-not $Content.Contains($Term)) {
      throw "Dashboard manifest surface missing term '$Term' in $File"
    }
  }
}

Write-Host "PHASE 3B DASHBOARD MANIFEST SURFACE GUARD PASSED"
