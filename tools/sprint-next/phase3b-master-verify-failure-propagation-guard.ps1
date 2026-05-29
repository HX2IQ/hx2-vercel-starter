$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B MASTER VERIFY FAILURE PROPAGATION GUARD =="

$ClosurePath = "tools/sprint-next/phase3b-sprint-closure.ps1"

if (!(Test-Path $ClosurePath)) {
  throw "Missing closure script"
}

$Closure = Get-Content $ClosurePath -Raw

$RequiredTerms = @(
  "phase3b-master-production-verify.ps1",
  '$LASTEXITCODE',
  "Phase 3B master production verify failed"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Closure.Contains($Term)) {
    throw "Closure missing master verify failure propagation term: $Term"
  }
}

Write-Host "PHASE 3B MASTER VERIFY FAILURE PROPAGATION GUARD PASSED"
