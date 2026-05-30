$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE SMART THRESHOLD GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE SMART DEPLOY THRESHOLD",
  "Deploy threshold mode:",
  "Estimated deploys avoided:",
  "AUTO MODE RESOURCE PROFILE",
  "Resource profile:",
  "Serverless pressure:",
  "Verification pressure:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode smart threshold missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE SMART THRESHOLD GUARD PASSED"
