$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B ORIGIN MAIN PREFLIGHT =="

git fetch origin | Out-Null

$RequiredFiles = @(
  "app/api/hx2/orchestration-compiler/route.ts",
  "app/api/hx2/orchestration-stage-dependencies/route.ts",
  "app/api/hx2/orchestration-stage-graph/route.ts",
  "app/api/hx2/orchestration-execution-plan/route.ts",
  "app/api/hx2/phase3b-orchestration-status/route.ts",
  "app/api/hx2/_lib/orchestration-compiler.ts",
  "app/api/hx2/_lib/orchestration-stage-dependency-registry.ts",
  "app/api/hx2/_lib/orchestration-stage-graph.ts",
  "app/api/hx2/_lib/orchestration-execution-plan.ts",
  "app/api/hx2/_lib/phase3b-orchestration-status.ts"
)

$OriginFiles = git ls-tree -r origin/main --name-only

foreach ($File in $RequiredFiles) {
  if ($OriginFiles -notcontains $File) {
    throw "origin/main missing required Phase 3B file: $File"
  }
}

Write-Host "PHASE 3B ORIGIN MAIN PREFLIGHT PASSED"
