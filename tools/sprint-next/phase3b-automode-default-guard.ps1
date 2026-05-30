$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE DEFAULT GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "NoAutoMode",
  "AutoMode default enabled",
  "Use -NoAutoMode to force legacy behavior",
  '$AutoMode = $true'
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode default missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE DEFAULT GUARD PASSED"
