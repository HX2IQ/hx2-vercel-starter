$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE EFFICIENCY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE EFFICIENCY SCORE",
  "Efficiency score:",
  "Efficiency classification:",
  "AUTO MODE CHANGE CLASSIFICATION",
  "Change class:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode efficiency missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE EFFICIENCY GUARD PASSED"
