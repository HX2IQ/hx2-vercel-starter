$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION OUTCOME EVALUATOR GUARD =="

$route = "app/api/hx2/orchestration-outcome/route.ts"
$evaluator = "app/api/hx2/_lib/operator-followthrough-evaluator.ts"
$learning = "app/api/hx2/_lib/orchestration-outcome-learning-record.ts"
$persistence = "app/api/hx2/_lib/orchestration-outcome-persistence.ts"

foreach ($path in @($route, $evaluator, $learning, $persistence)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$evalText = Get-Content $evaluator -Raw
$learningText = Get-Content $learning -Raw
$persistenceText = Get-Content $persistence -Raw

$checks = @{
  route = @(
    "POST","NextResponse.json","recorded_outcome",
    "followthrough_evaluation","learning_record",
    "persistence","persistOrchestrationOutcomeLearningRecord"
  )
  evaluator = @(
    "OperatorFollowthroughEvaluation","buildOperatorFollowthroughEvaluation",
    "aligned","partial","misaligned","guard_failure"
  )
  learning = @(
    "OrchestrationOutcomeLearningRecord","buildOrchestrationOutcomeLearningRecord",
    "completed_guard_count","learning_weight","learning_summary"
  )
  persistence = @(
    "persistOrchestrationOutcomeLearningRecord",
    "outcome-learning-records.jsonl",
    "appendFileSync",
    "persisted",
    "tools/orchestration-outcome/data/outcome-learning-records.jsonl"
  )
}

$texts = @{
  route = $routeText
  evaluator = $evalText
  learning = $learningText
  persistence = $persistenceText
}

$missing = @()

foreach ($section in $checks.Keys) {
  foreach ($needle in $checks[$section]) {
    if ($texts[$section] -notlike "*$needle*") {
      $missing += "Missing in ${section}: $needle"
    }
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration outcome evaluator guard failed"
}

Write-Host "ORCHESTRATION OUTCOME EVALUATOR GUARD PASSED"
