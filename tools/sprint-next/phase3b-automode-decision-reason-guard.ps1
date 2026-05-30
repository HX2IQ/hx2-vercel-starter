$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DECISION REASON GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "Decision reason:",
  "AutoModeReason",
  "Estimated deploy savings: HIGH",
  "Estimated deploy savings: LOW",
  "Production/API/runtime behavior affected"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode decision reason missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DECISION REASON GUARD PASSED"
