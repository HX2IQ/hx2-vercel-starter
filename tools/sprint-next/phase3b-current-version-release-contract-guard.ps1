$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B CURRENT VERSION RELEASE CONTRACT GUARD =="

$VersionPath = "app/api/hx2/_lib/phase3b-build-process-version.ts"

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-release-notes-consistency-guard.ps1",
  "tools/sprint-next/phase3b-release-notes-production-probe.ps1",
  "tools/sprint-next/phase3b-build-process-version-number-guard.ps1",
  "tools/sprint-next/phase3b-build-process-current-contract-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing current version release contract file: $File"
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
  "Build process upgraded to $CurrentVersion",
  "latest_production_verify_summary",
  "production_probe_timing_summary"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Current version release contract missing term: $Term"
  }
}

$OldVersionPatterns = @(
  'Build process upgraded to 3b\.1',
  'Build process upgraded to 3b\.2',
  'Build process upgraded to 3b\.3',
  'Build process upgraded to 3b\.4'
)

foreach ($Pattern in $OldVersionPatterns) {
  if (($Combined -match $Pattern) -and ($Pattern -notmatch [regex]::Escape($CurrentVersion))) {
    throw "Old release contract version reference still present: $Pattern"
  }
}

Write-Host "Current release contract version: $CurrentVersion"
Write-Host "PHASE 3B CURRENT VERSION RELEASE CONTRACT GUARD PASSED"
