$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT COMPOSITION ORDER GUARD =="

$composition = "app/api/hx2/_lib/sprint-next-composition.ts"
$decision = "app/api/hx2/_lib/sprint-next-decision-stage.ts"

foreach ($file in @($composition, $decision)) {
  if (!(Test-Path $file)) {
    throw "Missing required file: $file"
  }
}

$compositionText = Get-Content $composition -Raw
$decisionText = Get-Content $decision -Raw

$compositionRequired = @(
  "buildCapabilityPlan",
  "buildSprintNextLearningTelemetryStage",
  "buildSprintNextAction",
  "buildDev2SprintPackage",
  "classifyOrchestrationExecutionContext",
  "applyContextToLearningWeightStrategy",
  "applyRecursiveVerificationToPackage",
  "applyVerificationEscalation",
  "buildVerificationSynthesis",
  "applyVerificationSynthesisToPackage",
  "buildOrchestrationRecoveryRecommendation",
  "buildOrchestrationSelfAwareness",
  "buildAdaptiveOrchestrationRestraint",
  "applyAdaptiveRestraintToPackage",
  "buildOrchestrationConfidenceDecay",
  "buildSprintNextDecisionStage",
  "dev2_sprint_package"
)

$decisionRequired = @(
  "buildDev2OperatorDecision",
  "applyTelemetryInfluenceToOperatorDecision",
  "applyConfidenceToOperatorDecision",
  "applyVerificationEscalationToOperatorDecision",
  "applyConfidenceDecayToOperatorDecision"
)

$missing = @()

foreach ($needle in $compositionRequired) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing composition stage: $needle"
  }
}

foreach ($needle in $decisionRequired) {
  if ($decisionText -notlike "*$needle*") {
    $missing += "Missing decision stage: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint next composition order guard failed"
}

Write-Host "SPRINT NEXT COMPOSITION ORDER GUARD PASSED"
