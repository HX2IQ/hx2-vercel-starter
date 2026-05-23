$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT LOCAL CONTRACT TEST =="

$route = "app/api/hx2/sprint-next/route.ts"
$planner = "app/api/hx2/_lib/capability-planner.ts"
$buildops = "app/api/hx2/_lib/capability-buildops-sprint-plan.ts"
$action = "app/api/hx2/_lib/sprint-next-action.ts"
$riskGate = "app/api/hx2/_lib/sprint-next-risk-gate.ts"
$riskGateActions = "app/api/hx2/_lib/sprint-risk-gate-actions.ts"
$packageSuccess = "app/api/hx2/_lib/dev2-package-success-learning.ts"
$adaptiveStrategy = "app/api/hx2/_lib/adaptive-dev2-package-strategy.ts"
$adaptiveModifier = "app/api/hx2/_lib/adaptive-package-execution-modifier.ts"
$operatorDecision = "app/api/hx2/_lib/dev2-operator-decision.ts"
$operatorFollowthrough = "app/api/hx2/_lib/operator-decision-followthrough.ts"
$outcomeTelemetrySummary = "app/api/hx2/_lib/outcome-telemetry-summary.ts"
$outcomeTelemetryInfluence = "app/api/hx2/_lib/outcome-telemetry-influence.ts"
$telemetryDecision = "app/api/hx2/_lib/telemetry-influenced-operator-decision.ts"
$weightedConfidence = "app/api/hx2/_lib/weighted-orchestration-confidence.ts"
$telemetryQuality = "app/api/hx2/_lib/outcome-telemetry-quality.ts"
$qualityConfidence = "app/api/hx2/_lib/telemetry-quality-governed-confidence.ts"
$persistentWeights = "app/api/hx2/_lib/persistent-learning-weights.ts"
$weightsConfidence = "app/api/hx2/_lib/learning-weights-influence-confidence.ts"
$confidenceDecision = "app/api/hx2/_lib/confidence-influenced-operator-decision.ts"
$confidencePackage = "app/api/hx2/_lib/confidence-modified-sprint-package.ts"

foreach ($path in @($route, $planner, $buildops, $action, $riskGate, $riskGateActions, $packageSuccess, $adaptiveStrategy, $adaptiveModifier, $operatorDecision, $operatorFollowthrough)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$plannerText = Get-Content $planner -Raw
$buildopsText = Get-Content $buildops -Raw
$actionText = Get-Content $action -Raw
$riskGateText = Get-Content $riskGate -Raw
$riskGateActionsText = Get-Content $riskGateActions -Raw
$packageSuccessText = Get-Content $packageSuccess -Raw
$adaptiveStrategyText = Get-Content $adaptiveStrategy -Raw
$adaptiveModifierText = Get-Content $adaptiveModifier -Raw
$operatorDecisionText = Get-Content $operatorDecision -Raw
$operatorFollowthroughText = Get-Content $operatorFollowthrough -Raw
$outcomeTelemetrySummaryText = Get-Content $outcomeTelemetrySummary -Raw
$outcomeTelemetryInfluenceText = Get-Content $outcomeTelemetryInfluence -Raw
$telemetryDecisionText = Get-Content $telemetryDecision -Raw
$weightedConfidenceText = Get-Content $weightedConfidence -Raw
$telemetryQualityText = Get-Content $telemetryQuality -Raw
$qualityConfidenceText = Get-Content $qualityConfidence -Raw
$persistentWeightsText = Get-Content $persistentWeights -Raw
$weightsConfidenceText = Get-Content $weightsConfidence -Raw
$confidenceDecisionText = Get-Content $confidenceDecision -Raw
$confidencePackageText = Get-Content $confidencePackage -Raw

$required = @(
  @{ name = "route uses planner"; ok = $routeText -like "*buildCapabilityPlan*" },
  @{ name = "route returns sprint_next"; ok = $routeText -like "*sprint_next*" },
  @{ name = "route returns planner payload"; ok = $routeText -like "*planner*" },
  @{ name = "planner detects buildops"; ok = $plannerText -like "*buildops_execution*" },
  @{ name = "planner returns buildops sprint plan"; ok = $plannerText -like "*buildops_sprint_plan*" },
  @{ name = "buildops helper supports bugfix"; ok = $buildopsText -like "*bugfix*" },
  @{ name = "buildops helper supports guard hardening"; ok = $buildopsText -like "*guard_hardening*" },
  @{ name = "buildops helper supports feature expansion"; ok = $buildopsText -like "*feature_expansion*" },
  @{ name = "sprint action helper exists"; ok = $actionText -like "*buildSprintNextAction*" },
  @{ name = "sprint action returns feature name"; ok = $actionText -like "*dev2_feature_name*" },
  @{ name = "sprint action returns next action"; ok = $actionText -like "*next_action*" },
  @{ name = "sprint action returns recommended guard"; ok = $actionText -like "*recommended_guard*" },
  @{ name = "route returns actionable sprint"; ok = $routeText -like "*actionable_sprint*" },
  @{ name = "DEV2 package has execution phases"; ok = (Get-Content "app/api/hx2/_lib/sprint-dev2-package.ts" -Raw) -like "*execution_phases*" },
  @{ name = "DEV2 package has copy-ready PowerShell"; ok = (Get-Content "app/api/hx2/_lib/sprint-dev2-package.ts" -Raw) -like "*copy_ready_powershell*" },
  @{ name = "route returns risk gate"; ok = $routeText -like "*risk_gate*" },
  @{ name = "risk gate helper exists"; ok = $riskGateText -like "*buildSprintNextRiskGate*" },
  @{ name = "risk gate supports proceed"; ok = $riskGateText -like "*proceed*" },
  @{ name = "risk gate supports guard first"; ok = $riskGateText -like "*guard_first*" },
  @{ name = "risk gate supports inspect first"; ok = $riskGateText -like "*inspect_first*" },
  @{ name = "route returns risk gate actions"; ok = $routeText -like "*risk_gate_actions*" },
  @{ name = "risk gate actions helper exists"; ok = $riskGateActionsText -like "*buildSprintRiskGateActions*" },
  @{ name = "risk gate actions returns sequence"; ok = $riskGateActionsText -like "*recommended_sequence*" },
  @{ name = "route returns DEV2 package success signal"; ok = $routeText -like "*dev2_package_success_signal*" },
  @{ name = "DEV2 package success helper exists"; ok = $packageSuccessText -like "*buildDev2PackageSuccessSignal*" },
  @{ name = "DEV2 package success score exists"; ok = $packageSuccessText -like "*success_score*" },
  @{ name = "DEV2 package success type exists"; ok = $packageSuccessText -like "*package_type*" },
  @{ name = "route returns adaptive package strategy"; ok = $routeText -like "*adaptive_package_strategy*" },
  @{ name = "adaptive strategy helper exists"; ok = $adaptiveStrategyText -like "*buildAdaptivePackageStrategy*" },
  @{ name = "adaptive strategy supports stability first"; ok = $adaptiveStrategyText -like "*stability_first*" },
  @{ name = "adaptive strategy supports balanced execution"; ok = $adaptiveStrategyText -like "*balanced_execution*" },
  @{ name = "adaptive strategy supports expansion ready"; ok = $adaptiveStrategyText -like "*expansion_ready*" },
  @{ name = "adaptive modifier helper exists"; ok = $adaptiveModifierText -like "*applyAdaptivePackageExecution*" },
  @{ name = "adaptive modifier supports stability first"; ok = $adaptiveModifierText -like "*stability_first*" },
  @{ name = "adaptive modifier supports balanced execution"; ok = $adaptiveModifierText -like "*balanced_execution*" },
  @{ name = "adaptive modifier supports expanded surface"; ok = $adaptiveModifierText -like "*expanded orchestration surface allowed*" },
  @{ name = "adaptive modifier returns modification audit"; ok = $adaptiveModifierText -like "*adaptive_modification_audit*" },
  @{ name = "adaptive modifier returns modified fields"; ok = $adaptiveModifierText -like "*modified_fields*" },
  @{ name = "operator decision helper exists"; ok = $operatorDecisionText -like "*buildDev2OperatorDecision*" },
  @{ name = "operator decision supports proceed"; ok = $operatorDecisionText -like "*proceed*" },
  @{ name = "operator decision supports inspect"; ok = $operatorDecisionText -like "*inspect*" },
  @{ name = "operator decision supports stabilize"; ok = $operatorDecisionText -like "*stabilize*" },
  @{ name = "operator decision supports expand"; ok = $operatorDecisionText -like "*expand*" },
  @{ name = "route returns operator decision"; ok = $routeText -like "*operator_decision*" },
  @{ name = "route returns operator followthrough"; ok = $routeText -like "*operator_followthrough*" },
  @{ name = "operator followthrough helper exists"; ok = $operatorFollowthroughText -like "*buildOperatorDecisionFollowthrough*" },
  @{ name = "operator followthrough has expected path"; ok = $operatorFollowthroughText -like "*expected_operator_path*" },
  @{ name = "operator followthrough has learning message"; ok = $operatorFollowthroughText -like "*learning_message*" },
  @{ name = "outcome telemetry summary helper exists"; ok = $outcomeTelemetrySummaryText -like "*buildOutcomeTelemetrySummary*" },
  @{ name = "outcome telemetry summary reads jsonl"; ok = $outcomeTelemetrySummaryText -like "*outcome-learning-records.jsonl*" },
  @{ name = "outcome telemetry influence helper exists"; ok = $outcomeTelemetryInfluenceText -like "*buildOutcomeTelemetryInfluence*" },
  @{ name = "route returns outcome telemetry summary"; ok = $routeText -like "*outcome_telemetry_summary*" },
  @{ name = "route returns outcome telemetry influence"; ok = $routeText -like "*outcome_telemetry_influence*" },
  @{ name = "telemetry decision helper exists"; ok = $telemetryDecisionText -like "*applyTelemetryInfluenceToOperatorDecision*" },
  @{ name = "telemetry decision supports override"; ok = $telemetryDecisionText -like "*telemetry_override*" },
  @{ name = "route applies telemetry decision"; ok = $routeText -like "*applyTelemetryInfluenceToOperatorDecision*" },
  @{ name = "weighted confidence helper exists"; ok = $weightedConfidenceText -like "*buildWeightedOrchestrationConfidence*" },
  @{ name = "weighted confidence score exists"; ok = $weightedConfidenceText -like "*confidence_score*" },
  @{ name = "weighted confidence band exists"; ok = $weightedConfidenceText -like "*confidence_band*" },
  @{ name = "weighted confidence reason exists"; ok = $weightedConfidenceText -like "*confidence_reason*" },
  @{ name = "route returns orchestration confidence"; ok = $routeText -like "*orchestration_confidence*" },
  @{ name = "route returns telemetry quality"; ok = $routeText -like "*outcome_telemetry_quality*" },
  @{ name = "telemetry quality helper exists"; ok = $telemetryQualityText -like "*buildOutcomeTelemetryQuality*" },
  @{ name = "telemetry quality has insufficient band"; ok = $telemetryQualityText -like "*insufficient*" },
  @{ name = "quality confidence helper exists"; ok = $qualityConfidenceText -like "*applyTelemetryQualityToConfidence*" },
  @{ name = "quality confidence supports quality override"; ok = $qualityConfidenceText -like "*quality_override*" },
  @{ name = "route applies telemetry quality to confidence"; ok = $routeText -like "*applyTelemetryQualityToConfidence*" },
  @{ name = "persistent learning weights helper exists"; ok = $persistentWeightsText -like "*buildPersistentLearningWeights*" },
  @{ name = "persistent learning weights file exists"; ok = $persistentWeightsText -like "*orchestration-learning-weights.json*" },
  @{ name = "learning weights confidence helper exists"; ok = $weightsConfidenceText -like "*applyLearningWeightsToConfidence*" },
  @{ name = "learning weights audit exists"; ok = $weightsConfidenceText -like "*learning_weight_audit*" },
  @{ name = "route returns persistent learning weights"; ok = $routeText -like "*persistent_learning_weights*" },
  @{ name = "route applies learning weights to confidence"; ok = $routeText -like "*applyLearningWeightsToConfidence*" },
  @{ name = "confidence decision helper exists"; ok = $confidenceDecisionText -like "*applyConfidenceToOperatorDecision*" },
  @{ name = "confidence decision supports override"; ok = $confidenceDecisionText -like "*confidence_override*" },
  @{ name = "confidence decision tracks confidence band"; ok = $confidenceDecisionText -like "*confidence_band*" },
  @{ name = "route applies confidence decision"; ok = $routeText -like "*applyConfidenceToOperatorDecision*" },
  @{ name = "confidence package helper exists"; ok = $confidencePackageText -like "*applyConfidenceToSprintPackage*" },
  @{ name = "confidence package audit exists"; ok = $confidencePackageText -like "*confidence_package_audit*" },
  @{ name = "confidence package modifies scope"; ok = $confidencePackageText -like "*files_to_touch*" },
  @{ name = "route applies confidence package"; ok = $routeText -like "*applyConfidenceToSprintPackage*" },
  @{ name = "route applies adaptive package execution"; ok = $routeText -like "*applyAdaptivePackageExecution*" }
)

$failed = @()

foreach ($check in $required) {
  if (-not $check.ok) {
    $failed += $check.name
  }
}

if ($failed.Count -gt 0) {
  foreach ($f in $failed) {
    Write-Host "- Failed: $f"
  }
  throw "Sprint next local contract test failed"
}

Write-Host "SPRINT NEXT LOCAL CONTRACT TEST PASSED"



















