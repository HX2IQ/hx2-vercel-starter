$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST PRODUCTION VERIFY SUMMARY GUARD =="

$ViewerPath = "tools/sprint-next/phase3b-latest-production-verify-summary.ps1"

if (!(Test-Path $ViewerPath)) {
  throw "Missing latest production verify summary viewer"
}

$Viewer = Get-Content $ViewerPath -Raw

$RequiredTerms = @(
  "PHASE 3B LATEST PRODUCTION VERIFY SUMMARY",
  "phase3b-master-production-verify-*.json",
  "slowest_probes",
  "duration_seconds",
  "Validation skipped: false",
  "Advisory speed layer only"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Viewer.Contains($Term)) {
    throw "Latest production verify summary missing term: $Term"
  }
}

Write-Host "PHASE 3B LATEST PRODUCTION VERIFY SUMMARY GUARD PASSED"
