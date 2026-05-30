$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DEFAULT PRODUCTION CONTRACT GUARD =="

$ProbePath = "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"
$VersionPath = "app/api/hx2/_lib/phase3b-build-process-version.ts"
$DashboardPath = "tools/sprint-next/phase3b-build-dashboard.ps1"

foreach ($Path in @($ProbePath, $VersionPath, $DashboardPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing AutoMode default production contract file: $Path"
  }
}

$Combined = (Get-Content $ProbePath -Raw) + "`n" + (Get-Content $VersionPath -Raw) + "`n" + (Get-Content $DashboardPath -Raw)

$RequiredTerms = @(
  "automode_default_enabled",
  "automode_default_strategy",
  "dashboard_automode_default_visibility",
  "AutoMode default: true",
  "Cost-saving strategy: active"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "AutoMode default production contract missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DEFAULT PRODUCTION CONTRACT GUARD PASSED"
