$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT LOCAL CONTRACT TEST =="

$route = "app/api/hx2/sprint-next/route.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"
$decisionStage = "app/api/hx2/_lib/sprint-next-decision-stage.ts"

$helpers = @(
  "app/api/hx2/_lib/capability-planner.ts",
  "app/api/hx2/_lib/sprint-next-action.ts",
  "app/api/hx2/_lib/capability-buildops-sprint-plan.ts",
  "app/api/hx2/_lib/sprint-next-risk-gate.ts",
  "app/api/hx2/_lib/sprint-risk-gate-actions.ts",
  "app/api/hx2/_lib/sprint-dev2-package.ts",
  "app/api/hx2/_lib/dev2-package-success-learning.ts",
  "app/api/hx2/_lib/adaptive-dev2-package-strategy.ts",
  "app/api/hx2/_lib/adaptive-package-execution-modifier.ts",
  "app/api/hx2/_lib/dev2-operator-decision.ts",
  "app/api/hx2/_lib/operator-decision-followthrough.ts",
  "app/api/hx2/_lib/outcome-telemetry-summary.ts",
  "app/api/hx2/_lib/outcome-telemetry-influence.ts",
  "app/api/hx2/_lib/outcome-telemetry-quality.ts",
  "app/api/hx2/_lib/weighted-orchestration-confidence.ts",
  "app/api/hx2/_lib/telemetry-quality-governed-confidence.ts",
  "app/api/hx2/_lib/persistent-learning-weights.ts",
  "app/api/hx2/_lib/learning-weights-influence-confidence.ts",
  "app/api/hx2/_lib/learning-weight-driven-strategy.ts",
  "app/api/hx2/_lib/learning-weight-strategy-package-modifier.ts",
  "app/api/hx2/_lib/confidence-influenced-operator-decision.ts",
  "app/api/hx2/_lib/confidence-modified-sprint-package.ts"
)

foreach ($path in @($route, $composition, $decisionStage) + $helpers) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$compositionText = Get-Content $composition -Raw
$decisionStageText = Get-Content $decisionStage -Raw

$requiredRoute = @(
  "buildSprintNextPayload",
  "NextResponse.json",
  "request"
)

$requiredComposition = @(
  "buildCapabilityPlan",
  "buildSprintNextAction",
  "buildPlannerLearningSignals",
  "buildSprintHistorySummary",
  "sprint_next",
  "actionable_sprint",
  "risk_gate",
  "risk_gate_actions",
  "dev2_sprint_package",
  "dev2_package_success_signal",
  "adaptive_package_strategy",
  "operator_decision",
  "operator_followthrough",
  "outcome_telemetry_summary",
  "outcome_telemetry_influence",
  "orchestration_confidence",
  "outcome_telemetry_quality",
  "persistent_learning_weights",
  "learning_weight_driven_strategy",
  "applyTelemetryInfluenceToOperatorDecision",
  "applyTelemetryQualityToConfidence",
  "applyLearningWeightsToConfidence",
  "applyLearningWeightStrategyToPackage",
  "applyConfidenceToOperatorDecision",
  "applyConfidenceToSprintPackage",
  "applyAdaptivePackageExecution"
)

$decisionChecks = @(
  @{ name = "decision stage applies telemetry influence"; ok = $decisionStageText -like "*applyTelemetryInfluenceToOperatorDecision*" },
  @{ name = "decision stage applies confidence decision"; ok = $decisionStageText -like "*applyConfidenceToOperatorDecision*" }
)

$missing = @()

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Missing in thin route: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition helper: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint next local contract test failed"
}

Write-Host "SPRINT NEXT LOCAL CONTRACT TEST PASSED"














