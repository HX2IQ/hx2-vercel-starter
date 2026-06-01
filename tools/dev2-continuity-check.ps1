param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 CONTINUITY CHECK =="

Write-Host ""
Write-Host "[1/5] Bootstrap export"
powershell -ExecutionPolicy Bypass -File ".\tools\dev2-chat-bootstrap-export.ps1"

Write-Host ""
Write-Host "[2/5] Topology guard"
powershell -ExecutionPolicy Bypass -File ".\tools\dev2-topology-guard.ps1"

Write-Host ""
Write-Host "[3/5] Route contract guard"
powershell -ExecutionPolicy Bypass -File ".\tools\dev2-route-contract-guard.ps1" -BaseUrl $BaseUrl

Write-Host ""
Write-Host "[4/5] Live route diff"
powershell -ExecutionPolicy Bypass -File ".\tools\dev2-live-route-diff.ps1" -BaseUrl $BaseUrl

Write-Host ""
Write-Host "[5/5] TypeScript"
npx tsc --noEmit --pretty false

Write-Host ""
Write-Host "DEV2 CONTINUITY CHECK PASSED"
