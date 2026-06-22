$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 VERIFY STATUS DASHBOARD ==" -ForegroundColor Cyan

Write-Host ""
Write-Host "GIT SNAPSHOT" -ForegroundColor Cyan

$Branch = git branch --show-current
$Head = git --no-pager log --oneline -1
$StatusLines = git status --short

Write-Host ("Branch: {0}" -f $Branch)
Write-Host ("HEAD: {0}" -f $Head)

if (-not $StatusLines -or @($StatusLines).Count -eq 0) {
  Write-Host "Working tree: clean" -ForegroundColor Green
} else {
  Write-Host "Working tree: dirty" -ForegroundColor Yellow
  $StatusLines
}

Write-Host ""
Write-Host "AUTO VERIFY DECISION" -ForegroundColor Cyan

$AutoVerify = Join-Path $PSScriptRoot "hx2-verify-auto.ps1"

if (Test-Path $AutoVerify) {
  powershell -NoProfile -ExecutionPolicy Bypass -File $AutoVerify -DryRun
} else {
  Write-Host "Missing auto verify router: $AutoVerify" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "LATEST VERIFY LOG" -ForegroundColor Cyan

$LatestLogScript = Join-Path $PSScriptRoot "hx2-latest-verify-log.ps1"

if (Test-Path $LatestLogScript) {
  powershell -NoProfile -ExecutionPolicy Bypass -File $LatestLogScript -Count 1
} else {
  Write-Host "Missing latest verify log script: $LatestLogScript" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "VERIFY COMMANDS" -ForegroundColor Cyan
Write-Host "Decision only:       npm run hx2:verify:auto:dry"
Write-Host "Auto run correct:    npm run hx2:verify:auto"
Write-Host "Fast iteration:      npm run hx2:quick:fast:compact"
Write-Host "Full safety gate:    npm run hx2:quick:compact"
Write-Host "Owner UI lane:       npm run hx2:verify:owner-ui"
Write-Host "Owner UI fast lane:  npm run hx2:verify:owner-ui:fast"
Write-Host "Speed report all:    npm run hx2:verify:speed"
Write-Host "Speed report fast:   npm run hx2:verify:speed:fast"
Write-Host "Speed report full:   npm run hx2:verify:speed:full"
Write-Host "Deployment sync:     npm run hx2:deployment:sync"
Write-Host "Deploy sync check:   npm run hx2:deployment:sync:check"

Write-Host ""
Write-Host "GREEN: verify status dashboard complete" -ForegroundColor Green


