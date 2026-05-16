$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 MASTER BUILD GUARD ==" -ForegroundColor Cyan
Write-Host ""

$guards = @(
  ".\tools\bootstrap\validate-hx2-bootstrap.ps1",
  ".\tools\owner-console-layout-guard.ps1",
  ".\tools\owner-console-panel-order-guard.ps1",
  ".\tools\guard-hx2-grand-design.ps1",
  ".\tools\guard-hx2-syntax.ps1",
  ".\tools\hx2-benchmark-guard.ps1",
  ".\tools\orchestrator\orchestrator-status-guard.ps1",
  ".\tools\owner-console\orchestrator-panel-guard.ps1"
)

foreach ($guard in $guards) {
  if (!(Test-Path $guard)) {
    throw "Missing guard: $guard"
  }

  Write-Host ""
  Write-Host "Running $guard" -ForegroundColor Yellow

  powershell -ExecutionPolicy Bypass -File $guard

  if ($LASTEXITCODE -ne 0) {
    throw "Guard failed: $guard"
  }
}

Write-Host ""
Write-Host "ALL HX2 GUARDS PASSED" -ForegroundColor Green




