$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 CHAT MASTER GUARD BUNDLE ==" -ForegroundColor Cyan

$guards = @(
  ".\tools\chat-master\chat-master-foundation-check.ps1",
  ".\tools\chat-master\chat-master-status-guard.ps1",
  ".\tools\chat-master\chat-master-intent-contract-guard.ps1",
  ".\tools\chat-master\chat-master-router-guard.ps1"
)

foreach ($guard in $guards) {
  if (!(Test-Path $guard)) {
    throw "Missing chat-master guard: $guard"
  }

  Write-Host ""
  Write-Host "Running $guard" -ForegroundColor Yellow

  powershell -ExecutionPolicy Bypass -File $guard

  if ($LASTEXITCODE -ne 0) {
    throw "Chat-master guard failed: $guard"
  }
}

Write-Host ""
Write-Host "ALL CHAT MASTER GUARDS PASSED" -ForegroundColor Green




