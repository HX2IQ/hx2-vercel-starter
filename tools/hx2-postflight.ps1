param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "== HX2 postflight: build ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host "== HX2 postflight: deploy ==" -ForegroundColor Cyan
$deployLog = ".\tools\_postflight-vercel-deploy.log"
$deployPassed = $false

for ($attempt = 1; $attempt -le 2; $attempt++) {
  vercel --prod *>&1 | Tee-Object -FilePath $deployLog
  if ($LASTEXITCODE -eq 0) {
    $deployPassed = $true
    break
  }

  if ($attempt -lt 2) {
    Write-Host "Deploy failed on attempt $attempt. Retrying in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
  }
}

if (-not $deployPassed) {
  Write-Host "== deploy log tail ==" -ForegroundColor Yellow
  Get-Content $deployLog | Select-Object -Last 80
  throw "Deploy failed"
}

Write-Host "== HX2 postflight: settle delay ==" -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "== HX2 postflight: regression smoke ==" -ForegroundColor Cyan
pwsh -ExecutionPolicy Bypass -File .\tools\hx2-regression-smoke.ps1 -Base $Base
if ($LASTEXITCODE -ne 0) { throw "Regression smoke failed" }

Write-Host "== HX2 postflight: capture baseline ==" -ForegroundColor Cyan
$capturePassed = $false

for ($attempt = 1; $attempt -le 2; $attempt++) {
  pwsh -ExecutionPolicy Bypass -File .\tools\capture-hx2-baseline.ps1 -Base $Base
  if ($LASTEXITCODE -eq 0) {
    $capturePassed = $true
    break
  }

  if ($attempt -lt 2) {
    Write-Host "Baseline capture failed on attempt $attempt. Retrying in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
  }
}

if (-not $capturePassed) { throw "Baseline capture failed" }

Write-Host "== HX2 postflight: baseline diff ==" -ForegroundColor Cyan
$diffPassed = $false

for ($attempt = 1; $attempt -le 2; $attempt++) {
  pwsh -ExecutionPolicy Bypass -File .\tools\hx2-baseline-diff.ps1
  if ($LASTEXITCODE -eq 0) {
    $diffPassed = $true
    break
  }

  if ($attempt -lt 2) {
    Write-Host "Baseline diff failed on attempt $attempt. Retrying in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
  }
}

if (-not $diffPassed) { throw "Baseline diff failed" }

Write-Host "== HX2 postflight: release note ==" -ForegroundColor Cyan
$releasePassed = $false

for ($attempt = 1; $attempt -le 2; $attempt++) {
  pwsh -ExecutionPolicy Bypass -File .\tools\hx2-release-note.ps1
  if ($LASTEXITCODE -eq 0) {
    $releasePassed = $true
    break
  }

  if ($attempt -lt 2) {
    Write-Host "Release note generation failed on attempt $attempt. Retrying in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
  }
}

if (-not $releasePassed) { throw "Release note generation failed" }

Write-Host "== HX2 postflight: drift dashboard ==" -ForegroundColor Cyan
$dashboardPassed = $false

for ($attempt = 1; $attempt -le 2; $attempt++) {
  pwsh -ExecutionPolicy Bypass -File .\tools\build-hx2-drift-dashboard.ps1
  if ($LASTEXITCODE -eq 0) {
    $dashboardPassed = $true
    break
  }

  if ($attempt -lt 2) {
    Write-Host "Drift dashboard build failed on attempt $attempt. Retrying in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
  }
}

if (-not $dashboardPassed) { throw "Drift dashboard build failed" }

Write-Host "== HX2 postflight: owner summary ==" -ForegroundColor Cyan
$summaryPassed = $false

for ($attempt = 1; $attempt -le 2; $attempt++) {
  pwsh -ExecutionPolicy Bypass -File .\tools\hx2-owner-summary.ps1
  if ($LASTEXITCODE -eq 0) {
    $summaryPassed = $true
    break
  }

  if ($attempt -lt 2) {
    Write-Host "Owner summary generation failed on attempt $attempt. Retrying in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
  }
}

if (-not $summaryPassed) { throw "Owner summary generation failed" }

Write-Host ""
Write-Host "HX2 POSTFLIGHT PASSED" -ForegroundColor Green
















# == HX2 postflight success marker ==
try {
  $markerDir = ".\tools\markers"
  New-Item -ItemType Directory -Force -Path $markerDir | Out-Null

  $timestamp = (Get-Date).ToString("o")

  $marker = @{
    last_successful_postflight = $timestamp
  } | ConvertTo-Json -Depth 5

  $markerPath = Join-Path $markerDir "last-postflight.json"
  Set-Content $markerPath $marker -Encoding UTF8

  $historyPath = Join-Path $markerDir "postflight-history.jsonl"
  $entry = @{
    timestamp = $timestamp
    status = "success"
    baseline = $null
    release_note = $null
  } | ConvertTo-Json -Compress

  Add-Content -Path $historyPath -Value $entry -Encoding UTF8

  Write-Host "Postflight marker written: $markerPath"
  Write-Host "Postflight history appended: $historyPath"
} catch {
  Write-Host "Postflight marker write failed"
}

