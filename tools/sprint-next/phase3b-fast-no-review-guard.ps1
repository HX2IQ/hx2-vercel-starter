$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST NO REVIEW GUARD =="

$AliasPath = "tools/sprint-next/sprint-next.ps1"

if (!(Test-Path $AliasPath)) {
  throw "Missing sprint alias: $AliasPath"
}

$Alias = Get-Content $AliasPath -Raw

$RequiredTerms = @(
  '[switch]$FastNoReview',
  'if ($FastNoReview) { $ArgsList += "-SkipDiffSummary" }'
)

foreach ($Term in $RequiredTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "FastNoReview alias missing required term: $Term"
  }
}

Write-Host "PHASE 3B FAST NO REVIEW GUARD PASSED"
