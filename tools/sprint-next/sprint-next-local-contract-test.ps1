$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT LOCAL CONTRACT TEST =="

$route = "app/api/hx2/sprint-next/route.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"
$decisionStage = "app/api/hx2/_lib/sprint-next-decision-stage.ts"

foreach ($path in @($route, $composition, $decisionStage)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$compositionText = Get-Content $composition -Raw
$decisionText = Get-Content $decisionStage -Raw

$checks = @(
  @{ name = "thin route uses composition helper"; ok = $routeText -like "*buildSprintNextPayload*" },
  @{ name = "composition returns sprint_next"; ok = $compositionText -like "*sprint_next*" },
  @{ name = "composition returns actionable sprint"; ok = $compositionText -like "*actionable_sprint*" },
  @{ name = "composition returns risk gate"; ok = $compositionText -like "*risk_gate*" },
  @{ name = "composition returns DEV2 package"; ok = $compositionText -like "*dev2_sprint_package*" },
  @{ name = "composition returns telemetry summary"; ok = $compositionText -like "*outcome_telemetry_summary*" },
  @{ name = "composition returns orchestration confidence"; ok = $compositionText -like "*orchestration_confidence*" },
  @{ name = "composition applies adaptive package execution"; ok = $compositionText -like "*applyAdaptivePackageExecution*" },
  @{ name = "composition applies confidence package"; ok = $compositionText -like "*applyConfidenceToSprintPackage*" },
  @{ name = "composition applies learning weight package modifier"; ok = $compositionText -like "*applyLearningWeightStrategyToPackage*" },
  @{ name = "composition applies recursive verification"; ok = $compositionText -like "*applyRecursiveVerificationToPackage*" },
  @{ name = "composition applies verification escalation"; ok = $compositionText -like "*applyVerificationEscalation*" },
  @{ name = "composition applies synthesis package modifier"; ok = $compositionText -like "*applyVerificationSynthesisToPackage*" },
  @{ name = "composition applies restraint package modifier"; ok = $compositionText -like "*applyAdaptiveRestraintToPackage*" },
  @{ name = "composition uses decision stage"; ok = $compositionText -like "*buildSprintNextDecisionStage*" },
  @{ name = "decision stage applies telemetry influence"; ok = $decisionText -like "*applyTelemetryInfluenceToOperatorDecision*" },
  @{ name = "decision stage applies confidence decision"; ok = $decisionText -like "*applyConfidenceToOperatorDecision*" },
  @{ name = "decision stage applies verification escalation decision"; ok = $decisionText -like "*applyVerificationEscalationToOperatorDecision*" },
  @{ name = "decision stage applies confidence decay decision"; ok = $decisionText -like "*applyConfidenceDecayToOperatorDecision*" }
)

$failed = @()

foreach ($check in $checks) {
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
