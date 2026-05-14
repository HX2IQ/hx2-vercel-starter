$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 VERIFY ALL ==" -ForegroundColor Cyan

Write-Host ""
Write-Host "== grand design guard =="
npm run hx2:guard

Write-Host ""
Write-Host "== planner smoke =="
npm run hx2:planner

Write-Host ""
Write-Host "== router smoke =="
npm run hx2:router

Write-Host ""
Write-Host "== chat-master smoke =="
npm run hx2:smoke

Write-Host ""
Write-Host "== production smoke =="
npm run hx2:prod

Write-Host ""
Write-Host "HX2 VERIFY ALL PASSED." -ForegroundColor Green
