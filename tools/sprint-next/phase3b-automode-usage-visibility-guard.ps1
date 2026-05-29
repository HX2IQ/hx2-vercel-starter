$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE USAGE VISIBILITY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE RESULT",
  "Execution mode: LOCAL ONLY",
  "Execution mode: FULL DEPLOY",
  "Expected Vercel usage",
  "Expected VPS usage"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode usage visibility missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE USAGE VISIBILITY GUARD PASSED"
