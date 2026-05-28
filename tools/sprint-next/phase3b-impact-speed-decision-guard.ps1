$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B IMPACT SPEED DECISION GUARD =="

$Path = "tools/sprint-next/phase3b-impact-speed-decision.ps1"

if (!(Test-Path $Path)) {
  throw "Missing impact speed decision script: $Path"
}

$Content = Get-Content $Path -Raw

$RequiredTerms = @(
  "PHASE 3B IMPACT SPEED DECISION",
  "candidate_for_cached_validation",
  "candidate_for_targeted_validation_after_more_calibration",
  "full_validation_required",
  "Validation skipped: false",
  "Advisory only: true"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Content.Contains($Term)) {
    throw "Impact speed decision missing required term: $Term"
  }
}

Write-Host "PHASE 3B IMPACT SPEED DECISION GUARD PASSED"
