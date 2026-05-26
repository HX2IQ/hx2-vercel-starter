$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION EXECUTION PLAN GUARD =="

$PlanPath = "app/api/hx2/_lib/orchestration-execution-plan.ts"
$RoutePath = "app/api/hx2/orchestration-execution-plan/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($PlanPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Plan = Get-Content $PlanPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getOrchestrationExecutionPlanSnapshot",
  "read_only_preview",
  "composition_mutation_allowed: false",
  "execution_ready",
  "planned_stages",
  "planned_stage_count",
  "preview_only",
  "graph_summary",
  "blocking_reasons"
)

foreach ($Term in $RequiredTerms) {
  if ($Plan -notmatch [regex]::Escape($Term)) {
    throw "Execution plan missing required term: $Term"
  }
}

if ($Plan -match "sprint-next-composition") {
  throw "Execution plan must not import sprint-next-composition"
}

if ($Composition -match "orchestration-execution-plan") {
  throw "Composition must not directly reference execution plan during Phase 3B"
}

if ($Route -notmatch "/api/hx2/orchestration-execution-plan") {
  throw "Execution plan route missing canonical route marker"
}

Write-Host "ORCHESTRATION EXECUTION PLAN GUARD PASSED"
