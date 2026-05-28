$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B PRODUCTION PROBE TIMING GUARD =="

$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

if (!(Test-Path $VerifyPath)) {
  throw "Missing master production verify script"
}

$Verify = Get-Content $VerifyPath -Raw

$RequiredTerms = @(
  "ProbeStartedAt",
  "ProbeDuration",
  "duration_seconds",
  "slowest_probes",
  "Sort-Object duration_seconds -Descending",
  "parallel_absolute_paths_with_serial_retry"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Verify.Contains($Term)) {
    throw "Production probe timing missing required term: $Term"
  }
}

Write-Host "PHASE 3B PRODUCTION PROBE TIMING GUARD PASSED"
