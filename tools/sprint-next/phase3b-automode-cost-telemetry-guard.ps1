$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B AUTOMODE COST TELEMETRY GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint-next alias"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  "AUTO MODE COST ESTIMATE",
  "Estimated Vercel build impact",
  "Estimated VPS impact",
  "Estimated savings mode",
  "AUTO MODE TELEMETRY",
  "Feature name:",
  "Probe URL:",
  "Fast review:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "AutoMode telemetry missing term: $Term"
  }
}

Write-Host "PHASE 3B AUTOMODE COST TELEMETRY GUARD PASSED"
