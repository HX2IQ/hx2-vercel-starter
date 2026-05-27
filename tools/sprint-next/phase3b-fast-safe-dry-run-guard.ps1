$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST SAFE DRY RUN GUARD =="

$FastPath = "tools/sprint-next/phase3b-fast-safe-sprint.ps1"

if (!(Test-Path $FastPath)) {
  throw "Missing fast safe sprint runner: $FastPath"
}

$Fast = Get-Content $FastPath -Raw

$RequiredTerms = @(
  "[switch]$DryRun",
  "DRY RUN PREVIEW",
  "FeatureName:",
  "Would run DEV2 feature compiler",
  "Would commit/deploy through full closure",
  "exit 0"
)

foreach ($Term in $RequiredTerms) {
  if ($Fast -notmatch [regex]::Escape($Term)) {
    throw "Dry run support missing required term: $Term"
  }
}

Write-Host "PHASE 3B FAST SAFE DRY RUN GUARD PASSED"
