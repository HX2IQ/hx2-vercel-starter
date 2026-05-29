$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD CAPABILITY CONSISTENCY GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "app/api/hx2/_lib/phase3b-release-manifest.ts",
  "app/api/hx2/_lib/phase3b-build-health-snapshot.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-release-manifest-production-probe.ps1",
  "tools/sprint-next/phase3b-build-health-full-production-probe.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard capability consistency file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "build_dashboard",
  "readonly_dashboard_guard",
  "latest_production_verify_summary",
  "dashboard.enabled",
  "dashboard.readonly_guard",
  "dashboard.latest_production_verify_summary"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Dashboard capability consistency missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD CAPABILITY CONSISTENCY GUARD PASSED"
