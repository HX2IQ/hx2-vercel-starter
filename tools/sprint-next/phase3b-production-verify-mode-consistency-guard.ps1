$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B PRODUCTION VERIFY MODE CONSISTENCY GUARD =="

$Files = @(
  "tools/sprint-next/phase3b-master-production-verify.ps1",
  "tools/sprint-next/phase3b-parallel-production-verify-guard.ps1",
  "tools/sprint-next/phase3b-production-probe-timing-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing production verify mode file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "parallel_absolute_paths_with_serial_retry",
  "SERIAL RETRY FAILED PROBES",
  "passed_on_serial_retry",
  "duration_seconds",
  "slowest_probes"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Production verify mode consistency missing term: $Term"
  }
}

$DeprecatedTerms = @(
  'mode = `"parallel`"',
  'mode = `"parallel_absolute_paths`"'
)

foreach ($Term in $DeprecatedTerms) {
  if ($Combined.Contains($Term)) {
    throw "Deprecated production verify mode reference still present: $Term"
  }
}

Write-Host "PHASE 3B PRODUCTION VERIFY MODE CONSISTENCY GUARD PASSED"
