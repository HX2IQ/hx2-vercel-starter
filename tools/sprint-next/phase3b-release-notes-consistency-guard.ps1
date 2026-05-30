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
  "Added build health snapshot",
  "Added parallel production verification",
  "Added serial retry fallback for failed parallel probes",
  "Build process upgraded to 3b.3",
  "Added impact speed decision advisory",
  "Added cached validation advisory without skipping validation",
  "Exposed advisory speed layer in build health",
  "Exposed advisory speed layer in sprint snapshot",
  "Build process upgraded to 3b.4"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Release notes consistency missing term: $Term"
  }
}

Write-Host "PHASE 3B RELEASE NOTES CONSISTENCY GUARD PASSED"













