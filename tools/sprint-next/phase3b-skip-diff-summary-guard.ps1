$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B SKIP DIFF SUMMARY GUARD =="

$FastPath = "tools/sprint-next/phase3b-fast-safe-sprint.ps1"
$AliasPath = "tools/sprint-next/sprint-next.ps1"

foreach ($Path in @($FastPath, $AliasPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Fast = Get-Content $FastPath -Raw
$Alias = Get-Content $AliasPath -Raw

$RequiredFastTerms = @(
  '[switch]$SkipDiffSummary',
  'PRE-COMMIT DIFF SUMMARY',
  'PRE-COMMIT DIFF SUMMARY SKIPPED'
)

foreach ($Term in $RequiredFastTerms) {
  if (-not $Fast.Contains($Term)) {
    throw "Fast runner missing required SkipDiffSummary term: $Term"
  }
}

$RequiredAliasTerms = @(
  '[switch]$SkipDiffSummary',
  '-SkipDiffSummary'
)

foreach ($Term in $RequiredAliasTerms) {
  if (-not $Alias.Contains($Term)) {
    throw "Sprint alias missing required SkipDiffSummary term: $Term"
  }
}

Write-Host "PHASE 3B SKIP DIFF SUMMARY GUARD PASSED"
