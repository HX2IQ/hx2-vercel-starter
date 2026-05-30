$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DEPLOY MEMORY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE DEPLOY MEMORY",
  "phase3b-automode-deploy-memory.json",
  "Previous execution mode:",
  "Previous risk level:",
  "Deploy memory updated."
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode deploy memory missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DEPLOY MEMORY GUARD PASSED"
