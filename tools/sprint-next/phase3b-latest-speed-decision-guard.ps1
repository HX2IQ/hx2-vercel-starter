$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST SPEED DECISION GUARD =="

$ViewerPath = "tools/sprint-next/phase3b-latest-speed-decision.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing latest speed decision viewer: $ViewerPath"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST SPEED DECISION",
  "phase3b-impact-speed-decision-*.json",
  "speed_decision",
  "risk_level",
  "validation_skipped",
  "advisory_only"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Viewer.Contains($Term)) {
    throw "Latest speed decision viewer missing required term: $Term"
  }
}

Write-Host "PHASE 3B LATEST SPEED DECISION GUARD PASSED"
