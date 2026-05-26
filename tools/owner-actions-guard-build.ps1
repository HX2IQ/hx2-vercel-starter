$ErrorActionPreference = "Stop"

Write-Host "== owner actions preflight ==" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\tools\check-owner-actions-preflight.ps1

Write-Host "`n== freeze canonical to live page ==" -ForegroundColor Cyan
Copy-Item ".\tools\canonical\owner-actions-page.canonical.tsx" ".\app\owner-console\actions\page.tsx" -Force

Write-Host "`n== next build ==" -ForegroundColor Cyan
npm run build

Write-Host "`nOwner actions guard build passed" -ForegroundColor Green
