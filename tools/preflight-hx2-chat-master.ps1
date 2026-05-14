$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 chat-master preflight ==" -ForegroundColor Cyan

Write-Host ""
Write-Host "== verify all =="
npm run hx2:verify
if ($LASTEXITCODE -ne 0) { throw "HX2 verify-all failed" }

Write-Host ""
Write-Host "== build =="
.\tools\diagnose-build.ps1

Write-Host ""
Write-Host "== deploy =="
vercel --prod
if ($LASTEXITCODE -ne 0) { throw "Deploy failed" }

Write-Host ""
Write-Host "HX2 chat-master preflight passed." -ForegroundColor Green
