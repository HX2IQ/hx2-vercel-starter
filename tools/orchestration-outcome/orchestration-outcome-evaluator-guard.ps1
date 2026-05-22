$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION OUTCOME EVALUATOR GUARD =="

$route = "app/api/hx2/orchestration-outcome/route.ts"
$evaluator = "app/api/hx2/_lib/operator-followthrough-evaluator.ts"

foreach ($path in @($route, $evaluator)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$evalText = Get-Content $evaluator -Raw

$requiredRoute = @(
  "POST",
  "NextResponse.json",
  "execution_id",
  "runtime_status",
  "completed_guards",
  "recorded_outcome",
  "followthrough_evaluation",
  "buildOperatorFollowthroughEvaluation"
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

$missing = @()

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Missing in outcome route: $needle"
  }
}

foreach ($needle in $requiredEvaluator) {
  if ($evalText -notlike "*$needle*") {
    $missing += "Missing in evaluator: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Orchestration outcome evaluator guard failed"
}

Write-Host "ORCHESTRATION OUTCOME EVALUATOR GUARD PASSED"
