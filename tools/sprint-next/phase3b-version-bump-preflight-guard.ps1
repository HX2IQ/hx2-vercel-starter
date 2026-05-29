$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B VERSION BUMP PREFLIGHT GUARD =="

$Path = "tools/sprint-next/phase3b-bump-build-process-version.ps1"

if (!(Test-Path $Path)) {
  throw "Missing version bump helper"
}

$Content = Get-Content $Path -Raw

$RequiredTerms = @(
  "VERSION BUMP PREFLIGHT",
  "Current version:",
  "Target version:",
  "Release note:",
  "Target files:"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Content.Contains($Term)) {
    throw "Version bump preflight missing term: $Term"
  }
}

Write-Host "PHASE 3B VERSION BUMP PREFLIGHT GUARD PASSED"
