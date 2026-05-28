$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B RELEASE MANIFEST BUILD PROCESS PRODUCTION GUARD =="

$ProbePath = "tools/sprint-next/phase3b-release-manifest-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing release manifest production probe: $ProbePath"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "Release manifest missing build_process",
  "Release manifest build_process missing process_version",
  "Release manifest build_process process_version is blank",
  "Release manifest build_process missing release_notes",
  "Release manifest build_process release_notes too short"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Release manifest build_process production probe missing term: $Term"
  }
}

Write-Host "PHASE 3B RELEASE MANIFEST BUILD PROCESS PRODUCTION GUARD PASSED"
