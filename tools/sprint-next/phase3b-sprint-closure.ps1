param(
  [string]$ProbeUrl = "https://optinodeiq.com",
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B SPRINT CLOSURE =="

$Guards = @(
  "tools/sprint-next/orchestration-compiler-stability-guard.ps1",
  "tools/sprint-next/orchestration-compiler-dependency-guard.ps1",
  "tools/sprint-next/orchestration-compiler-contract-guard.ps1",
  "tools/sprint-next/orchestration-stage-dependency-registry-guard.ps1",
  "tools/sprint-next/orchestration-compiler-dependency-integration-guard.ps1",
  "tools/sprint-next/orchestration-stage-graph-guard.ps1",
  "tools/sprint-next/orchestration-stage-graph-cycle-guard.ps1",
  "tools/sprint-next/orchestration-stage-graph-topological-guard.ps1",
  "tools/sprint-next/orchestration-execution-plan-guard.ps1",
  "tools/sprint-next/phase3b-sprint-closure-guard.ps1"
)

foreach ($Guard in $Guards) {
  if (!(Test-Path $Guard)) {
    throw "Missing guard: $Guard"
  }

  Write-Host "`n== RUN GUARD: $Guard =="
  powershell -ExecutionPolicy Bypass -File $Guard
}

Write-Host "`n== BUILD =="
npm run build

if (-not $SkipDeploy) {
  Write-Host "`n== DEPLOY PRODUCTION =="
  git push origin main
  npx vercel --prod --force

  Write-Host "`n== WAIT FOR PROPAGATION =="
  Start-Sleep -Seconds 60
}

Write-Host "`n== PROBE COMPILER =="
Invoke-RestMethod "$ProbeUrl/api/hx2/orchestration-compiler" |
  ConvertTo-Json -Depth 20

Write-Host "`n== PROBE STAGE DEPENDENCIES =="
Invoke-RestMethod "$ProbeUrl/api/hx2/orchestration-stage-dependencies" |
  ConvertTo-Json -Depth 20

Write-Host "`n== PROBE STAGE GRAPH =="
Invoke-RestMethod "$ProbeUrl/api/hx2/orchestration-stage-graph" |
  ConvertTo-Json -Depth 20

Write-Host "`n== PROBE EXECUTION PLAN =="
Invoke-RestMethod "$ProbeUrl/api/hx2/orchestration-execution-plan" |
  ConvertTo-Json -Depth 20

Write-Host "`n== RUN PHASE 3B STATUS PRODUCTION PROBE =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-orchestration-status-production-probe.ps1" -BaseUrl $ProbeUrl

Write-Host "`nPHASE 3B SPRINT CLOSURE PASSED"


