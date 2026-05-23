$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT COMPOSITION ORDER GUARD =="

$file = "app/api/hx2/_lib/sprint-next-composition.ts"

if (!(Test-Path $file)) {
  throw "Missing sprint-next-composition.ts"
}

$text = Get-Content $file -Raw

$order = @(
  "const plan =",
  "const learningSignals =",
  "const sprintHistorySummary =",
  "const persistentLearningWeights =",
  "const learningWeightDrivenStrategy =",
  "const outcomeTelemetrySummary =",
  "const outcomeTelemetryQuality =",
  "const outcomeTelemetryInfluence =",
  "const rawConfidence =",
  "const qualityConfidence =",
  "const orchestrationConfidence =",
  "const sprintAction =",
  "const basePayload =",
  "const riskGate =",
  "const riskGateActions =",
  "const powershellActions =",
  "const packageSeed =",
  "const dev2SprintPackage =",
  "const orchestrationExecutionContext =",
  "const successSignal =",
  "const adaptiveStrategy =",
  "const adaptivePackage =",
  "const confidencePackage =",
  "const strategyPackage =",
  "const baseDecision =",
  "const telemetryDecision =",
  "const confidenceDecision ="
)

$missing = @()
$positions = @{}

foreach ($item in $order) {
  $idx = $text.IndexOf($item)

  if ($idx -lt 0) {
    $missing += "Missing composition stage: $item"
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
    Write-Host "- Composition order violation:"
    Write-Host "  $current appears AFTER $next"
    throw "Sprint next composition order guard failed"
  }
}

Write-Host "SPRINT NEXT COMPOSITION ORDER GUARD PASSED"
