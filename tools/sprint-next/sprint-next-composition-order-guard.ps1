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

$compositionOrder = @(
  "const plan =",
  "const learningTelemetry =",
  "const sprintAction =",
  "const basePayload =",
  "const riskGate =",
  "const riskGateActions =",
  "const powershellActions =",
  "const packageSeed =",
  "const dev2SprintPackage =",
  "const orchestrationExecutionContext =",
  "const contextAdjustedLearningStrategy =",
  "const successSignal =",
  "const adaptiveStrategy =",
  "const adaptivePackage =",
  "const confidencePackage =",
  "const strategyPackage =",
  "const verifiedPackage =",
  "const verificationTrustPosture =",
  "const escalatedPackage =",
  "const verificationSynthesis =",
  "const synthesisPackage =",
  "const recoveryRecommendation =",
  "const orchestrationSelfAwareness =",
  "const orchestrationRestraint =",
  "const restraintAdjustedPackage =",
  "const orchestrationConfidenceDecay =",
  "const finalOperatorDecision ="
)

$decisionOrder = @(
  "const baseDecision =",
  "const telemetryDecision =",
  "const confidenceDecision =",
  "const escalationDecision =",
  "const confidenceDecayDecision ="
)

function Test-Order($text, $order, $label) {
  $positions = @{}
  $missing = @()

  foreach ($item in $order) {
    $idx = $text.IndexOf($item)

    if ($idx -lt 0) {
      $missing += "Missing $label stage: $item"
    } else {
      $positions[$item] = $idx
    }
  }

  if ($missing.Count -gt 0) {
    foreach ($m in $missing) { Write-Host "- $m" }
    throw "Sprint next composition order guard failed"
  }

  for ($i = 0; $i -lt ($order.Count - 1); $i++) {
    $current = $order[$i]
    $next = $order[$i + 1]

    if ($positions[$current] -gt $positions[$next]) {
      Write-Host "- $label order violation:"
      Write-Host "  $current appears AFTER $next"
      throw "Sprint next composition order guard failed"
    }
  }
}

Test-Order $compositionText $compositionOrder "composition"
Test-Order $decisionText $decisionOrder "decision"

Write-Host "SPRINT NEXT COMPOSITION ORDER GUARD PASSED"
