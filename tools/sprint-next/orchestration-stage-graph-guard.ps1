$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION STAGE GRAPH GUARD =="

$GraphPath = "app/api/hx2/_lib/orchestration-stage-graph.ts"
$RoutePath = "app/api/hx2/orchestration-stage-graph/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($GraphPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Graph = Get-Content $GraphPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getOrchestrationStageGraphSnapshot",
  "read_only_preview",
  "composition_mutation_allowed: false",
  "node_count",
  "edge_count",
  "nodes",
  "edges",
  "compiler_ready",
  "dependency_validation"
)

foreach ($Term in $RequiredTerms) {
  if ($Graph -notmatch [regex]::Escape($Term)) {
    throw "Stage graph missing required term: $Term"
  }
}

if ($Graph -match "sprint-next-composition") {
  throw "Stage graph must not import sprint-next-composition"
}

if ($Composition -match "orchestration-stage-graph") {
  throw "Composition must not directly reference stage graph during Phase 3B"
}

if ($Route -notmatch "/api/hx2/orchestration-stage-graph") {
  throw "Stage graph route missing canonical route marker"
}

Write-Host "ORCHESTRATION STAGE GRAPH GUARD PASSED"
