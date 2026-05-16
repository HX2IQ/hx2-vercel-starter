$ErrorActionPreference = "Stop"

$overall = [System.Diagnostics.Stopwatch]::StartNew()

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

  $sw = [System.Diagnostics.Stopwatch]::StartNew()

  Write-Host ""
  Write-Host "Running $guard" -ForegroundColor Yellow

  powershell -ExecutionPolicy Bypass -File $guard

  $sw.Stop()

  Write-Host ("Completed in {0} ms" -f $sw.ElapsedMilliseconds) -ForegroundColor DarkGray

  if ($LASTEXITCODE -ne 0) {
    throw "Quick verify failed: $guard"
  }
}

$overall.Stop()

Write-Host ""
Write-Host ("HX2 QUICK VERIFY PASSED ({0} ms total)" -f $overall.ElapsedMilliseconds) -ForegroundColor Green

