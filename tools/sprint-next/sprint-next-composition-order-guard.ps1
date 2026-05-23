$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT COMPOSITION ORDER GUARD =="

$file = "app/api/hx2/_lib/sprint-next-composition.ts"

if (!(Test-Path $file)) {
  throw "Missing sprint-next-composition.ts"
}

$text = Get-Content $file -Raw

$order = @(
  "buildCapabilityPlan",
  "buildPlannerLearningSignals",
  "buildSprintHistorySummary",
  "buildPersistentLearningWeights",
  "buildLearningWeightDrivenStrategy",
  "buildOutcomeTelemetrySummary",
  "buildOutcomeTelemetryQuality",
  "buildOutcomeTelemetryInfluence",
  "buildWeightedOrchestrationConfidence",
  "applyTelemetryQualityToConfidence",
  "applyLearningWeightsToConfidence",
  "buildSprintNextAction",
  "buildSprintNextRiskGate",
  "buildSprintRiskGateActions",
  "buildSprintPowerShellActions",
  "buildDev2SprintPackage",
  "classifyOrchestrationExecutionContext",
  "buildDev2PackageSuccessSignal",
  "buildAdaptivePackageStrategy",
  "applyAdaptivePackageExecution",
  "applyConfidenceToSprintPackage",
  "applyLearningWeightStrategyToPackage",
  "buildDev2OperatorDecision",
  "applyTelemetryInfluenceToOperatorDecision",
  "applyConfidenceToOperatorDecision",
  "buildOperatorDecisionFollowthrough",
  "buildOrchestrationExecutionMemory",
  "buildOrchestrationRuntimeOutcome"
)

$missing = @()
$positions = @{}

foreach ($item in $order) {

  $idx = $text.IndexOf($item)

  if ($idx -lt 0) {
    $missing += "Missing orchestration stage: $item"
  }
  else {
    $positions[$item] = $idx
  }
}

if ($missing.Count -gt 0) {

  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint next composition order guard failed"
}

for ($i = 0; $i -lt ($order.Count - 1); $i++) {

  $current = $order[$i]
  $next = $order[$i + 1]

  if ($positions[$current] -gt $positions[$next]) {

    Write-Host "- Composition order violation:"
    Write-Host "  $current appears AFTER $next"

    throw "Sprint next composition order guard failed"
  }
}

Write-Host "SPRINT NEXT COMPOSITION ORDER GUARD PASSED"
