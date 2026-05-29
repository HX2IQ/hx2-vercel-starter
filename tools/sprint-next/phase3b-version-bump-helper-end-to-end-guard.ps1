$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B VERSION BUMP HELPER END-TO-END GUARD =="

$Files = @(
  "tools/sprint-next/phase3b-bump-build-process-version.ps1",
  "tools/sprint-next/phase3b-version-bump-helper-guard.ps1",
  "tools/sprint-next/phase3b-version-bump-helper-selftest.ps1",
  "app/api/hx2/_lib/phase3b-build-process-version.ts"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing version bump helper E2E file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "DryRun",
  "VERSION BUMP DRY RUN",
  "No files changed",
  "Build process version bumped",
  "Selftest dry run only",
  "3b.10"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Version bump helper E2E missing term: $Term"
  }
}

Write-Host "PHASE 3B VERSION BUMP HELPER END-TO-END GUARD PASSED"
