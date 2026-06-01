param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 SPRINT RESUME GATE =="

Write-Host ""
Write-Host "[1/6] Continuity check"
npm run dev2:continuity

Write-Host ""
Write-Host "[2/6] Precheck"
npm run dev2:precheck

Write-Host ""
Write-Host "[3/6] Postdeploy verify"
npm run dev2:postdeploy

Write-Host ""
Write-Host "[4/6] Recovery export"
npm run dev2:recovery

Write-Host ""
Write-Host "[5/6] Handoff export"
npm run dev2:handoff

Write-Host ""
Write-Host "[6/6] TypeScript"
npx tsc --noEmit --pretty false

Write-Host ""
Write-Host "DEV2 SPRINT RESUME GATE PASSED"
Write-Host "HX2 is safe to resume feature sprints."
