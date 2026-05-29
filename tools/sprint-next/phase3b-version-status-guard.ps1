$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B VERSION STATUS GUARD =="

$ViewerPath = "tools/sprint-next/phase3b-version-status.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing version status viewer"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "PHASE 3B VERSION STATUS",
  "phase3b-build-process-version",
  "process_version",
  "capabilities",
  "release_notes"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Viewer.Contains($Term)) {
    throw "Version status viewer missing term: $Term"
  }
}

Write-Host "PHASE 3B VERSION STATUS GUARD PASSED"
