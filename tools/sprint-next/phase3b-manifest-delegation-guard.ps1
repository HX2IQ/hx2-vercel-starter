$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B MANIFEST DELEGATION GUARD =="

$MasterPath = "tools/sprint-next/phase3b-master-production-verify.ps1"
$ReleaseNotesPath = "tools/sprint-next/phase3b-release-notes-production-probe.ps1"

foreach ($Path in @($MasterPath, $ReleaseNotesPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Master = Get-Content $MasterPath -Raw
$ReleaseNotes = Get-Content $ReleaseNotesPath -Raw

if ($Master.Contains("phase3b-release-manifest-production-probe.ps1")) {
  throw "Master verify should not directly run release manifest probe; delegated through release notes probe"
}

$RequiredReleaseNotesTerms = @(
  "Release manifest must pass its own production probe before release-notes alignment",
  "phase3b-release-manifest-production-probe.ps1",
  "Release manifest version mismatch"
)

foreach ($Term in $RequiredReleaseNotesTerms) {
  if (-not $ReleaseNotes.Contains($Term)) {
    throw "Release notes probe missing manifest delegation term: $Term"
  }
}

Write-Host "PHASE 3B MANIFEST DELEGATION GUARD PASSED"
