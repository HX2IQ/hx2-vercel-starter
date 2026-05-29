$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B PRODUCTION SUMMARY CAPABILITY CONSISTENCY GUARD =="

$Files = @(
  "app/api/hx2/_lib/phase3b-build-process-version.ts",
  "tools/sprint-next/phase3b-build-process-version-guard.ps1",
  "tools/sprint-next/phase3b-build-process-version-production-probe.ps1",
  "tools/sprint-next/phase3b-latest-production-verify-summary.ps1",
  "tools/sprint-next/phase3b-latest-production-verify-summary-guard.ps1"
)

foreach ($File in $Files) {
  if (!(Test-Path $File)) {
    throw "Missing production summary capability file: $File"
  }
}

$Combined = ($Files | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$RequiredTerms = @(
  "latest_production_verify_summary",
  "production_probe_timing_summary",
  "Added latest production verify summary viewer",
  "Added production probe timing summary",
  "slowest_probes",
  "duration_seconds"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Combined.Contains($Term)) {
    throw "Production summary capability consistency missing term: $Term"
  }
}

Write-Host "PHASE 3B PRODUCTION SUMMARY CAPABILITY CONSISTENCY GUARD PASSED"
