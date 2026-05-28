$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B SPEED ADVISORY CONSISTENCY GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-health-snapshot.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts",
  "tools/sprint-next/phase3b-build-health-full-production-probe.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing speed advisory file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "speed_advisory",
  "cached_validation_advisory_only",
  "impact_speed_decision_advisory",
  "validation_skipped",
  "validation_skipped: false",
  "must not skip validation"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Speed advisory consistency missing term: $Term"
  }
}

Write-Host "PHASE 3B SPEED ADVISORY CONSISTENCY GUARD PASSED"
