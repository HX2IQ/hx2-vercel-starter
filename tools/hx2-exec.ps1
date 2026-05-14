$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== HX2 EXECUTIVE RUN ==="

Write-Host ""
Write-Host "[1/4] Benchmark Guard"
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-benchmark-guard.ps1"

Write-Host ""
Write-Host "[2/4] Save History Snapshot"
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-benchmark-history.ps1"

Write-Host ""
Write-Host "[3/4] Trend Report"
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-benchmark-trend.ps1"

Write-Host ""
Write-Host "[4/4] Status Center"
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-status.ps1"

Write-Host ""
Write-Host "HX2 Executive Run Complete."
