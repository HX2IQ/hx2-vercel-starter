$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST AUTOMODE DECISION GUARD =="

$ViewerPath = "tools/sprint-next/phase3b-latest-automode-decision.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing latest AutoMode decision viewer"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST AUTOMODE DECISION",
  "phase3b-automode-decision-*.json",
  "execution_mode",
  "deploy_skipped",
  "decision_reason",
  "adaptive_score"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Viewer.Contains($Term)) {
    throw "Latest AutoMode decision viewer missing term: $Term"
  }
}

Write-Host "PHASE 3B LATEST AUTOMODE DECISION GUARD PASSED"
