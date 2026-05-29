$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B VERSION BUMP HELPER GUARD =="

$Path = "tools/sprint-next/phase3b-bump-build-process-version.ps1"

if (!(Test-Path $Path)) {
  throw "Missing version bump helper"
}

$Content = Get-Content $Path -Raw

$RequiredTerms = @(
  "NewVersion",
  "ReleaseNote",
  "process_version",
  "release-notes-consistency",
  "release-notes-production-probe",
  "Build process version bumped"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Content.Contains($Term)) {
    throw "Version bump helper missing term: $Term"
  }
}

Write-Host "PHASE 3B VERSION BUMP HELPER GUARD PASSED"
