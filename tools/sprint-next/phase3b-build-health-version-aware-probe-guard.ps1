$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B BUILD HEALTH VERSION-AWARE PROBE GUARD =="

$ProbePath = "tools/sprint-next/phase3b-build-health-full-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing build health full production probe: $ProbePath"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "Expected process version",
  "VersionSourcePath",
  "Could not detect local process_version",
  "Build health process_version mismatch",
  "speed_advisory",
  "validation_skipped"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Build health version-aware probe missing required term: $Term"
  }
}

if ($Probe.Contains('process_version -ne "3b.')) {
  throw "Build health probe still contains hardcoded version comparison"
}

Write-Host "PHASE 3B BUILD HEALTH VERSION-AWARE PROBE GUARD PASSED"
