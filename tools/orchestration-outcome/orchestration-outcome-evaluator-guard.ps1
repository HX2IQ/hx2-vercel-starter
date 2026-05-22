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

$requiredRoute = @(
  "POST",
  "NextResponse.json",
  "execution_id",
  "runtime_status",
  "completed_guards",
  "recorded_outcome",
  "followthrough_evaluation",
  "learning_record",
  "buildOperatorFollowthroughEvaluation",
  "buildOrchestrationOutcomeLearningRecord",
  "persistOrchestrationOutcomeLearningRecord",
  "persistence"
)

$requiredEvaluator = @(
  "OperatorFollowthroughEvaluation",
  "buildOperatorFollowthroughEvaluation",
  "alignment",
  "aligned",
  "partial",
  "misaligned",
  "evaluation_reason",
  "guard_failure"
)

$requiredLearning = @(
  "OrchestrationOutcomeLearningRecord",
  "buildOrchestrationOutcomeLearningRecord",
  "persistOrchestrationOutcomeLearningRecord",
  "persistence",
  "execution_id",
  "runtime_status",
  "alignment",
  "completed_guard_count",
  "learning_weight",
  "learning_summary"
)

$requiredPersistence = @(
  "persistOrchestrationOutcomeLearningRecord",
  "outcome-learning-records.jsonl",
  "appendFileSync",
  "persisted",
  "tools/orchestration-outcome/data/outcome-learning-records.jsonl"
)

$missing = @()

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Missing in route: $needle"
  }
}

foreach ($needle in $requiredEvaluator) {
  if ($evalText -notlike "*$needle*") {
    $missing += "Missing in evaluator: $needle"
  }
}

foreach ($needle in $requiredLearning) {
  if ($learningText -notlike "*$needle*") {
    $missing += "Missing in learning record: $needle"
  }
}

foreach ($needle in $requiredPersistence) {
  if ($persistenceText -notlike "*$needle*") {
    $missing += "Missing in persistence helper: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Orchestration outcome evaluator guard failed"
}

Write-Host "ORCHESTRATION OUTCOME EVALUATOR GUARD PASSED"

