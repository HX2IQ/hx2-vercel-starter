$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DECISION VIEWER CONTRACT GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-build-process-version-guard.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-latest-automode-decision.ps1",
  "tools/sprint-next/phase3b-build-dashboard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing AutoMode decision viewer contract file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "latest_automode_decision_viewer",
  "Added latest AutoMode decision viewer",
  "phase3b-latest-automode-decision.ps1",
  "execution_mode",
  "deploy_skipped",
  "decision_reason"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "AutoMode decision viewer contract missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DECISION VIEWER CONTRACT GUARD PASSED"
