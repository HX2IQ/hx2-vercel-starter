$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B DASHBOARD CONTRACT CAPABILITY GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-build-process-version-guard.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-dashboard-surface-consistency-guard.ps1",
  "tools/sprint-next/phase3b-dashboard-capability-consistency-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing dashboard contract capability file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "dashboard_surface_consistency",
  "dashboard_capability_consistency",
  "Added dashboard surface consistency guard",
  "Added dashboard capability consistency guard"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Dashboard contract capability missing term: $Term"
  }
}

Write-Host "PHASE 3B DASHBOARD CONTRACT CAPABILITY GUARD PASSED"
