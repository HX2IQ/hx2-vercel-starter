param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 SPRINT PRECHECK =="

Write-Host ""
Write-Host "[1/7] TOPOLOGY GUARD"

powershell -ExecutionPolicy Bypass `
  -File ".\tools\dev2-topology-guard.ps1"

Write-Host ""
Write-Host "[2/7] ROUTE CONTRACT GUARD"

powershell -ExecutionPolicy Bypass `
  -File ".\tools\dev2-route-contract-guard.ps1" `
  -BaseUrl $BaseUrl

Write-Host ""
Write-Host "[3/7] LIVE ROUTE DIFF"

powershell -ExecutionPolicy Bypass `
  -File ".\tools\dev2-live-route-diff.ps1" `
  -BaseUrl $BaseUrl

Write-Host ""
Write-Host "[4/7] DEPLOYMENT SHA VERIFY"

powershell -ExecutionPolicy Bypass `
  -File ".\tools\dev2-deployment-sha-verify.ps1" `
  -BaseUrl $BaseUrl

Write-Host ""
Write-Host "[5/7] TYPESCRIPT CHECK"

npx tsc --noEmit --pretty false

Write-Host ""
Write-Host "[6/7] ROUTE INVENTORY"

powershell -ExecutionPolicy Bypass `
  -File ".\tools\dev2-route-inventory.ps1"

Write-Host ""
Write-Host "[7/7] TOPOLOGY FINGERPRINT"

powershell -ExecutionPolicy Bypass `
  -File ".\tools\dev2-topology-fingerprint.ps1"

Write-Host ""
Write-Host "DEV2 SPRINT PRECHECK PASSED"
