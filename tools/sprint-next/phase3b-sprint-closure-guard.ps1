$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B SPRINT CLOSURE GUARD =="

$RunnerPath = "tools/sprint-next/phase3b-sprint-closure.ps1"

if (!(Test-Path $RunnerPath)) {
  throw "Missing closure runner: $RunnerPath"
}

$Runner = Get-Content $RunnerPath -Raw

$RequiredTerms = @(
  "PHASE 3B SPRINT CLOSURE",
  "phase3b-route-existence-preflight.ps1",
  "phase3b-origin-main-preflight.ps1",
  "phase3b-vercel-alias-guard.ps1",
  "orchestration-compiler",
  "orchestration-stage-dependencies",
  "orchestration-stage-graph",
  "orchestration-execution-plan",
  "npx vercel --prod --force",
  "SkipDeploy",
  "PHASE 3B SPRINT CLOSURE PASSED"
)

foreach ($Term in $RequiredTerms) {
  if ($Runner -notmatch [regex]::Escape($Term)) {
    throw "Closure runner missing required term: $Term"
  }
}

Write-Host "PHASE 3B SPRINT CLOSURE GUARD PASSED"



