$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B SPRINT NEXT AUTOMODE GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AutoMode",
  "SPRINT NEXT AUTO MODE",
  "phase3b-impact-scan.ps1",
  "risk_level",
  "Auto decision: LocalOnly validation",
  "Auto decision: Full deploy + production verification"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "Sprint next AutoMode missing term: $Term"
  }
}

Write-Host "PHASE 3B SPRINT NEXT AUTOMODE GUARD PASSED"
