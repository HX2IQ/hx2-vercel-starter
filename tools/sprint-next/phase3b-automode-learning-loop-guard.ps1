$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE LEARNING LOOP GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE LEARNING LOOP",
  "Learning mode:",
  "Change density:",
  "AUTO MODE DEPLOYMENT CONFIDENCE",
  "Deployment confidence:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode learning loop missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE LEARNING LOOP GUARD PASSED"
