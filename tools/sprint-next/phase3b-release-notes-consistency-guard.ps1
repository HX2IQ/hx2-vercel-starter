$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B RELEASE NOTES CONSISTENCY GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "app/api/hx2/_lib/phase3b-build-health-snapshot.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing release notes file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "release_notes",
  "Added fast no review mode",
  "Added skip diff summary mode",
  "Added sprint audit logs",
  "Added master production verification",
  "Added build health snapshot"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Release notes consistency missing term: $Term"
  }
}

Write-Host "PHASE 3B RELEASE NOTES CONSISTENCY GUARD PASSED"
