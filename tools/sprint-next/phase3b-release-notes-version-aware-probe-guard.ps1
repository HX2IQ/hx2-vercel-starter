$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B RELEASE NOTES VERSION-AWARE PROBE GUARD =="

$ProbePath = "tools/sprint-next/phase3b-release-notes-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing release notes production probe: $ProbePath"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "Expected process version",
  "VersionSourcePath",
  "Could not detect local process_version",
  "Build process version mismatch",
  "Build health version mismatch",
  "Sprint snapshot version mismatch",
  "Release manifest version mismatch"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Release notes version-aware probe missing required term: $Term"
  }
}

if ($Probe.Contains('process_version -ne "3b.')) {
  throw "Release notes probe still contains hardcoded version comparison"
}

Write-Host "PHASE 3B RELEASE NOTES VERSION-AWARE PROBE GUARD PASSED"
