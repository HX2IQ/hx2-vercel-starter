$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS CURRENT CONTRACT GUARD =="

$VersionPath = "app/api/hx2/_lib/phase3b-build-process-version.ts"

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "app/api/hx2/_lib/phase3b-build-health-snapshot.ts",
  "app/api/hx2/_lib/phase3b-sprint-snapshot.ts",
  "app/api/hx2/_lib/phase3b-release-manifest.ts",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-build-health-full-production-probe.ps1",
  "tools/sprint-next/phase3b-release-notes-production-probe.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing current build process contract file: $File"
  }
}

$VersionSource = Get-Content $VersionPath -Raw
$VersionMatch = [regex]::Match($VersionSource, 'process_version:\s*"([^"]+)"')

if (-not $VersionMatch.Success) {
  throw "Could not detect process_version from $VersionPath"
}

$CurrentVersion = $VersionMatch.Groups[1].Value

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  $CurrentVersion,
  "parallel_production_verify",
  "serial_retry_fallback",
  "impact_speed_decision_advisory",
  "cached_validation_advisory_only",
  "Added parallel production verification",
  "Added serial retry fallback for failed parallel probes",
  "Added impact speed decision advisory",
  "Added cached validation advisory without skipping validation"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Current build process contract missing required term: $Term"
  }
}

$OldVersionPatterns = @(
  'process_version:\s*"3b\.1"',
  'process_version:\s*"3b\.2"',
  'process_version:\s*"3b\.3"',
  'process_version -ne "3b\.1"',
  'process_version -ne "3b\.2"',
  'process_version -ne "3b\.3"'
)

foreach ($Pattern in $OldVersionPatterns) {
  if ($Combined -match $Pattern) {
    throw "Old build process version reference still present: $Pattern"
  }
}

Write-Host "Current build process version: $CurrentVersion"
Write-Host "PHASE 3B BUILD PROCESS CURRENT CONTRACT GUARD PASSED"
