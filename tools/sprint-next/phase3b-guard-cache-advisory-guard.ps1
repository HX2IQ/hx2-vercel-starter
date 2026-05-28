$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B GUARD CACHE ADVISORY GUARD =="

$Path = "tools/sprint-next/phase3b-guard-cache-advisory.ps1"

if (!(Test-Path $Path)) {
  throw "Missing guard cache advisory script: $Path"
}

$Content = Get-Content $Path -Raw

$RequiredTerms = @(
  "PHASE 3B GUARD CACHE ADVISORY",
  "Get-FileHash",
  "phase3b-guard-cache.json",
  "changed_count",
  "unchanged_count",
  "ADVISORY"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Content.Contains($Term)) {
    throw "Guard cache advisory missing required term: $Term"
  }
}

Write-Host "PHASE 3B GUARD CACHE ADVISORY GUARD PASSED"
