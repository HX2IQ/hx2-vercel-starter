$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 AUTO SHIP ==" -ForegroundColor Cyan

Write-Host ""
Write-Host "== master guard ==" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-master-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Master guard failed" }

Write-Host ""
Write-Host "== build ==" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host ""
Write-Host "== final benchmark ==" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-benchmark-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Benchmark guard failed" }

Write-Host ""
Write-Host "== commit if needed ==" -ForegroundColor Yellow
git add .

$Status = git status --short
if ($Status) {
  $Stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
  git commit -m "auto ship $Stamp"
} else {
  Write-Host "Git tree already clean. No commit needed."
}

Write-Host ""
Write-Host "== safe deploy ==" -ForegroundColor Yellow
npm run hx2:ship
if ($LASTEXITCODE -ne 0) { throw "Safe deploy failed" }

Write-Host ""
Write-Host "== post-ship guard ==" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-master-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Post-ship master guard failed" }

Write-Host ""
Write-Host "HX2 AUTO SHIP COMPLETE" -ForegroundColor Green
