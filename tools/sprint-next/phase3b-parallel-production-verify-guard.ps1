$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B PARALLEL PRODUCTION VERIFY GUARD =="

$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

if (!(Test-Path $VerifyPath)) {
  throw "Missing master production verify script: $VerifyPath"
}

$Verify = Get-Content $VerifyPath -Raw

$RequiredTerms = @(
  "Start-Job",
  "Wait-Job",
  "Receive-Job",
  "Remove-Job",
  "Join-Path $RepoRoot",
  "Set-Location $RepoRoot",
  "parallel_absolute_paths_with_serial_retry",
  "FAILED PROBES",
  "SERIAL RETRY FAILED PROBES",
  "passed_on_serial_retry",
  "Missing production probe",
  "Production verify audit written",
  "phase3b-master-production-verify"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Verify.Contains($Term)) {
    throw "Parallel production verify missing required term: $Term"
  }
}

Write-Host "PHASE 3B PARALLEL PRODUCTION VERIFY GUARD PASSED"

