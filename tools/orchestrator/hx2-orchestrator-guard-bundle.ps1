$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 ORCHESTRATOR GUARD BUNDLE ==" -ForegroundColor Cyan

$guards = @(
  ".\tools\orchestrator\orchestrator-status-guard.ps1",
  ".\tools\owner-console\orchestrator-panel-guard.ps1",
  ".\tools\orchestrator\orchestrator-status-smoke.ps1"
)

foreach ($guard in $guards) {

  if (!(Test-Path $guard)) {
    throw "Missing orchestrator guard: $guard"
  }

  Write-Host ""
  Write-Host "Running $guard" -ForegroundColor Yellow

  powershell -NoProfile -ExecutionPolicy Bypass -File $guard

  if ($LASTEXITCODE -ne 0) {
    throw "Orchestrator guard failed: $guard"
  }
}

Write-Host ""
Write-Host "ALL ORCHESTRATOR GUARDS PASSED" -ForegroundColor Green

