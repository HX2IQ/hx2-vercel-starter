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
Write-Host "Functional audit:    npm run hx2:functional:audit"
Write-Host "Functional local:    npm run hx2:functional:audit:local"
Write-Host "Master probe:        npm run hx2:master:orchestrator:probe"
Write-Host "Master strict:       npm run hx2:master:orchestrator:probe:strict"
Write-Host "KGX probe:           npm run hx2:kgx:memory:probe"
Write-Host "KGX strict:          npm run hx2:kgx:memory:probe:strict"
Write-Host "Worker probe:        npm run hx2:worker:execution:probe"
Write-Host "Worker strict:       npm run hx2:worker:execution:probe:strict"
Write-Host "Auth probe:          npm run hx2:auth:billing:probe"
Write-Host "Auth strict:         npm run hx2:auth:billing:probe:strict"
Write-Host "Product reality:    npm run hx2:product:reality"
Write-Host "Product local:      npm run hx2:product:reality:local"
Write-Host "Product strict:     npm run hx2:product:reality:strict"
Write-Host "Chat E2E:           npm run hx2:chat:e2e"
Write-Host "Chat E2E local:     npm run hx2:chat:e2e:local"
Write-Host "Chat E2E strict:    npm run hx2:chat:e2e:strict"
Write-Host "Answer quality:     npm run hx2:answer:quality"
Write-Host "Answer local:       npm run hx2:answer:quality:local"
Write-Host "Answer strict:      npm run hx2:answer:quality:strict"
Write-Host "Retail contract:    npm run hx2:retail:contract"
Write-Host "Retail local:       npm run hx2:retail:contract:local"
Write-Host "Retail strict:      npm run hx2:retail:contract:strict"
Write-Host "Retail chat-master: npm run hx2:retail:chat-master"
Write-Host "Retail CM local:    npm run hx2:retail:chat-master:local"
Write-Host "Retail CM strict:   npm run hx2:retail:chat-master:strict"
Write-Host "Retail consumer:    npm run hx2:retail:consumer"
Write-Host "Consumer local:     npm run hx2:retail:consumer:local"
Write-Host "Consumer strict:    npm run hx2:retail:consumer:strict"

Write-Host ""
Write-Host "GREEN: verify status dashboard complete" -ForegroundColor Green







