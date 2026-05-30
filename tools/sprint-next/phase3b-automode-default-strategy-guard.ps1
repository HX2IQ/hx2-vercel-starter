$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DEFAULT STRATEGY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE EXECUTION POLICY",
  "Execution policy mode:",
  "SMART OPTIMIZATION ACTIVE",
  "AUTO MODE DEPLOY STRATEGY",
  "Deploy strategy:",
  "Expected cost profile:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode default strategy missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DEFAULT STRATEGY GUARD PASSED"
