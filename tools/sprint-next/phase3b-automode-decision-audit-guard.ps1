$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DECISION AUDIT GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "phase3b-automode-decision",
  "automode-decision-",
  "execution_mode",
  "deploy_skipped",
  "decision_reason",
  "adaptive_score",
  "AutoMode decision audit written"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode decision audit missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DECISION AUDIT GUARD PASSED"
