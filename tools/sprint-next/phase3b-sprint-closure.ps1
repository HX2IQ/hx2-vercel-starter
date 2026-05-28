param(
  [string]$ProbeUrl = "https://optinodeiq.com",
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B SPRINT CLOSURE =="

$Guards = @(
  "tools/sprint-next/phase3b-route-existence-preflight.ps1",
  "tools/sprint-next/orchestration-compiler-stability-guard.ps1",
  "tools/sprint-next/orchestration-compiler-dependency-guard.ps1",
  "tools/sprint-next/orchestration-compiler-contract-guard.ps1",
  "tools/sprint-next/orchestration-stage-dependency-registry-guard.ps1",
  "tools/sprint-next/orchestration-compiler-dependency-integration-guard.ps1",
  "tools/sprint-next/orchestration-stage-graph-guard.ps1",
  "tools/sprint-next/orchestration-stage-graph-cycle-guard.ps1",
  "tools/sprint-next/orchestration-stage-graph-topological-guard.ps1",
  "tools/sprint-next/orchestration-execution-plan-guard.ps1",
  "tools/sprint-next/phase3b-orchestration-status-guard.ps1",
  "tools/sprint-next/phase3b-release-manifest-guard.ps1",
  "tools/sprint-next/phase3b-route-matrix-guard.ps1",
  "tools/sprint-next/phase3b-route-matrix-count-guard.ps1",
  "tools/sprint-next/phase3b-route-contract-summary-guard.ps1",
  "tools/sprint-next/phase3b-sprint-snapshot-guard.ps1",
  "tools/sprint-next/phase3b-route-mode-contract-guard.ps1",
  "tools/sprint-next/phase3b-sprint-closure-guard.ps1",
  "tools/sprint-next/phase3b-fast-safe-sprint-guard.ps1",
  "tools/sprint-next/phase3b-fast-safe-sprint-audit-guard.ps1",
  "tools/sprint-next/phase3b-latest-audit-guard.ps1",
  "tools/sprint-next/phase3b-clean-tree-guard.ps1",
  "tools/sprint-next/phase3b-fast-safe-dry-run-guard.ps1"
)

foreach ($Guard in $Guards) {
  if (!(Test-Path $Guard)) {
    throw "Missing guard: $Guard"
  }

  Write-Host ""
  Write-Host "== RUN GUARD: $Guard =="
  powershell -ExecutionPolicy Bypass -File $Guard
}

Write-Host ""
Write-Host "== BUILD =="
npm run build

if ($SkipDeploy) {
  Write-Host ""
  Write-Host "PHASE 3B SPRINT CLOSURE PASSED - LOCAL ONLY / DEPLOY SKIPPED"
  exit 0
}

Write-Host ""
Write-Host "== DEPLOY PRODUCTION =="
git push origin main

Write-Host ""
Write-Host "== VERIFY ORIGIN MAIN HAS PHASE 3B FILES =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-origin-main-preflight.ps1"

npx vercel --prod --force

Write-Host ""
Write-Host "== WAIT FOR PROPAGATION =="
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "== VERIFY VERCEL DOMAIN ALIAS =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-vercel-alias-guard.ps1" -Domain $ProbeUrl

$Routes = @(
  "/api/hx2/orchestration-compiler",
  "/api/hx2/orchestration-stage-dependencies",
  "/api/hx2/orchestration-stage-graph",
  "/api/hx2/orchestration-execution-plan",
  "/api/hx2/phase3b-orchestration-status",
  "/api/hx2/phase3b-release-manifest",
  "/api/hx2/phase3b-route-matrix",
  "/api/hx2/phase3b-route-contract-summary",
  "/api/hx2/phase3b-sprint-snapshot"
)

foreach ($Route in $Routes) {
  Write-Host ""
  Write-Host "== PROBE $Route =="
  Invoke-RestMethod "$ProbeUrl$Route" | ConvertTo-Json -Depth 20
}

Write-Host ""
Write-Host "== RUN PHASE 3B BUILD HEALTH PRODUCTION PROBE =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-build-health-production-probe.ps1" -BaseUrl $ProbeUrl

Write-Host ""
Write-Host "== RUN PHASE 3B SPRINT SNAPSHOT PRODUCTION PROBE =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-sprint-snapshot-production-probe.ps1" -BaseUrl $ProbeUrl

Write-Host ""
Write-Host "== RUN PHASE 3B RELEASE MANIFEST PRODUCTION PROBE =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-release-manifest-production-probe.ps1" -BaseUrl $ProbeUrl

Write-Host ""
Write-Host "== RUN PHASE 3B ROUTE MATRIX PRODUCTION PROBE =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-route-matrix-production-probe.ps1" -BaseUrl $ProbeUrl

Write-Host ""
Write-Host "== RUN PHASE 3B STATUS PRODUCTION PROBE =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-orchestration-status-production-probe.ps1" -BaseUrl $ProbeUrl

Write-Host ""
Write-Host "== RUN PHASE 3B MASTER PRODUCTION VERIFY =="
powershell -ExecutionPolicy Bypass -File "tools/sprint-next/phase3b-master-production-verify.ps1" -BaseUrl $ProbeUrl

Write-Host ""
Write-Host "PHASE 3B SPRINT CLOSURE PASSED"



































