$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 QUICK VERIFY ==" -ForegroundColor Cyan
Write-Host ""

$guards = @(
  ".\tools\guard-hx2-syntax.ps1",
  ".\tools\orchestrator\hx2-orchestrator-guard-bundle.ps1",
  ".\tools\owner-console-layout-guard.ps1",
  ".\tools\owner-console-panel-order-guard.ps1"
)

foreach ($guard in $guards) {
  if (!(Test-Path $guard)) {
    throw "Missing quick guard: $guard"
  }

  Write-Host ""
  Write-Host "Running $guard" -ForegroundColor Yellow

  powershell -ExecutionPolicy Bypass -File $guard

  if ($LASTEXITCODE -ne 0) {
    throw "Quick verify failed: $guard"
  }
}

Write-Host ""
Write-Host "HX2 QUICK VERIFY PASSED" -ForegroundColor Green
