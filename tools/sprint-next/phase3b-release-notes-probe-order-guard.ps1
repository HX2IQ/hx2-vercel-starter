$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B RELEASE NOTES PROBE ORDER GUARD =="

$ProbePath = "tools/sprint-next/phase3b-release-notes-production-probe.ps1"

if (!(Test-Path $ProbePath)) {
  throw "Missing release notes production probe: $ProbePath"
}

$Probe = Get-Content $ProbePath -Raw

$RequiredTerms = @(
  "Release manifest must pass its own production probe before release-notes alignment",
  "phase3b-release-manifest-production-probe.ps1",
  "Expected process version",
  "Release manifest version mismatch"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Probe.Contains($Term)) {
    throw "Release notes probe order missing term: $Term"
  }
}

Write-Host "PHASE 3B RELEASE NOTES PROBE ORDER GUARD PASSED"
