$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD PROCESS VERSION PROBE GUARD =="

$ProbePath = "tools/sprint-next/phase3b-build-process-version-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing build process version production probe: $ProbePath"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "Expected process version",
  "process_version",
  "VersionSourcePath",
  "Could not detect local process_version",
  "Build process version mismatch",
  "parallel_production_verify",
  "serial_retry_fallback",
  "cached_validation_advisory_only"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Build process version probe missing required term: $Term"
  }
}

if ($Probe.Contains('process_version -ne "3b.')) {
  throw "Build process version probe still contains hardcoded version comparison"
}

Write-Host "PHASE 3B BUILD PROCESS VERSION PROBE GUARD PASSED"
