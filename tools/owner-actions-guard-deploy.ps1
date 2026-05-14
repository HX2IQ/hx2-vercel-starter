$ErrorActionPreference = "Stop"

Write-Host "== owner actions preflight ==" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\tools\check-owner-actions-preflight.ps1
if ($LASTEXITCODE -ne 0) { throw "Preflight failed" }

Write-Host "`n== freeze canonical to live page ==" -ForegroundColor Cyan
Copy-Item ".\tools\canonical\owner-actions-page.canonical.tsx" ".\app\owner-console\actions\page.tsx" -Force

Write-Host "`n== next build ==" -ForegroundColor Cyan
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host "`n== vercel deploy ==" -ForegroundColor Cyan
& vercel.cmd --prod
if ($LASTEXITCODE -ne 0) { throw "Deploy failed" }

Write-Host "`nOwner actions guard deploy passed" -ForegroundColor Green
exit 0
