$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 Post-Deploy Monitor ==" -ForegroundColor Cyan

$WaitSeconds = 30
Write-Host "Waiting $WaitSeconds seconds for Vercel alias/cache propagation..."
Start-Sleep -Seconds $WaitSeconds

Write-Host ""
Write-Host "Running production smoke..."
.\tools\smoke-hx2-production.ps1

Write-Host ""
Write-Host "PASS: Production is healthy after deploy." -ForegroundColor Green
