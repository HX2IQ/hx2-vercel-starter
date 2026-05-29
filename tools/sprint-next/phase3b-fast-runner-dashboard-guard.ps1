$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST RUNNER DASHBOARD GUARD =="

$FastPath = "tools/sprint-next/phase3b-fast-safe-sprint.ps1"

if (!(Test-Path $FastPath)) {
  throw "Missing fast runner"
}

$Fast = Get-Content $FastPath -Raw

if (-not $Fast.Contains("phase3b-build-dashboard.ps1")) {
  throw "Fast runner does not call build dashboard"
}

$DeprecatedDirectViewerCalls = @(
  "phase3b-latest-audit.ps1",
  "phase3b-latest-timing-report.ps1",
  "phase3b-latest-impact-report.ps1",
  "phase3b-latest-speed-decision.ps1",
  "phase3b-latest-production-verify-summary.ps1",
  "phase3b-version-status.ps1"
)

foreach ($Viewer in $DeprecatedDirectViewerCalls) {
  if ($Fast.Contains($Viewer) -and -not $Fast.Contains("phase3b-build-dashboard.ps1")) {
    throw "Fast runner should use dashboard instead of direct viewer call: $Viewer"
  }
}

Write-Host "PHASE 3B FAST RUNNER DASHBOARD GUARD PASSED"
