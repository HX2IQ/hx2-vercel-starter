$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 SAFE DEPLOY ==" -ForegroundColor Cyan

Write-Host ""
Write-Host "== clean git guard ==" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\tools\guard-clean-git.ps1"
if ($LASTEXITCODE -ne 0) { throw "Clean git guard failed" }

Write-Host ""
Write-Host "== master guard ==" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-master-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Master guard failed" }

Write-Host ""
Write-Host "== build ==" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host ""
Write-Host "== production deploy ==" -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -ne 0) { throw "Vercel deploy failed" }

Write-Host ""
Write-Host "== post deploy monitor ==" -ForegroundColor Yellow
if (Test-Path ".\tools\monitor-hx2-post-deploy.ps1") {
  powershell -ExecutionPolicy Bypass -File ".\tools\monitor-hx2-post-deploy.ps1"
  if ($LASTEXITCODE -ne 0) { throw "Post deploy monitor failed" }
}

Write-Host ""
Write-Host "== post deploy guard ==" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-master-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Post deploy master guard failed" }

Write-Host ""
Write-Host "SAFE DEPLOY COMPLETE" -ForegroundColor Green
