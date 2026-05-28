$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B TIMING THRESHOLD ADVISORY GUARD =="

$Path = "tools/sprint-next/phase3b-timing-threshold-advisory.ps1"

if (!(Test-Path $Path)) {
  throw "Missing timing threshold advisory: $Path"
}

$Content = Get-Content $Path -Raw

$RequiredTerms = @(
  "PHASE 3B TIMING THRESHOLD ADVISORY",
  "WarnAboveSeconds",
  "duration_seconds",
  "ADVISORY",
  "incremental/cached validation"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Content.Contains($Term)) {
    throw "Timing threshold advisory missing required term: $Term"
  }
}

Write-Host "PHASE 3B TIMING THRESHOLD ADVISORY GUARD PASSED"
