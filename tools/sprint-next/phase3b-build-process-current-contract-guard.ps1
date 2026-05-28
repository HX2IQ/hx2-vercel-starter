$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS CURRENT CONTRACT GUARD =="

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

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "3b.4",
  "parallel_production_verify",
  "serial_retry_fallback",
  "Added parallel production verification",
  "Added serial retry fallback for failed parallel probes",
  "Build process upgraded to 3b.4"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "current build process contract missing required term: $Term"
  }
}

if ($Combined.Contains('process_version -ne "3b.2"')) {
  throw "Old 3b.2 production probe expectation still present"
}

if ($Combined.Contains('process_version: "3b.2"')) {
  throw "Old 3b.2 source version still present"
}

Write-Host "PHASE 3B BUILD PROCESS CURRENT CONTRACT GUARD PASSED"


