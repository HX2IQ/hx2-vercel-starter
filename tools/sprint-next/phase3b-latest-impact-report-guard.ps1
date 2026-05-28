$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST IMPACT REPORT GUARD =="

$ViewerPath = "tools/sprint-next/phase3b-latest-impact-report.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing latest impact report viewer: $ViewerPath"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST IMPACT REPORT",
  "phase3b-impact-scan-*.json",
  "changed_file_count",
  "advisory_only",
  "validation_skipped",
  "ConvertFrom-Json"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Viewer.Contains($Term)) {
    throw "Latest impact report missing required term: $Term"
  }
}

Write-Host "PHASE 3B LATEST IMPACT REPORT GUARD PASSED"
