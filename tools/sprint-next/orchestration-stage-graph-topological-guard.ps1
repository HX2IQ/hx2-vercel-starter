$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION STAGE GRAPH TOPOLOGICAL GUARD =="

$GraphPath = "app/api/hx2/_lib/orchestration-stage-graph.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($GraphPath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Graph = Get-Content $GraphPath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "buildTopologicalExecutionPlan",
  "topological_plan",
  "execution_order",
  "blocked_stages",
  "planned_stage_count",
  "inDegree"
)

foreach ($Term in $RequiredTerms) {
  if ($Graph -notmatch [regex]::Escape($Term)) {
    throw "Stage graph topological plan missing term: $Term"
  }
}

if ($Graph -match "sprint-next-composition") {
  throw "Stage graph must not import sprint-next-composition"
}

if ($Composition -match "buildTopologicalExecutionPlan") {
  throw "Composition must not contain topological planning logic"
}

Write-Host "ORCHESTRATION STAGE GRAPH TOPOLOGICAL GUARD PASSED"
