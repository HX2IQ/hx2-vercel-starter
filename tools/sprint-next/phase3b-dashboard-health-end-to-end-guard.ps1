$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD HEALTH END-TO-END GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-build-process-version-guard.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-dashboard-health-capability-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard health E2E file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "dashboard_health: true",
  "dashboard_health",
  "Build process missing dashboard_health capability",
  "Added dashboard health capability to build process contract"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Dashboard health E2E missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD HEALTH END-TO-END GUARD PASSED"
