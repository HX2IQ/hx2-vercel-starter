$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== LEARNING WEIGHTS SUMMARY PREVIEW GUARD =="

$panel = "app/owner-console/_components/learning-weights-summary-panel.tsx"
$mount = "app/owner-console/_components/chat-master-panels.tsx"

foreach ($path in @($panel, $mount)) {
  if (!(Test-Path $path)) {
    throw "Missing required UI file: $path"
  }
}

$combined = (Get-Content $panel -Raw) + "`n" + (Get-Content $mount -Raw)

$required = @(
  "LearningWeightsSummaryPanel",
  "Persistent Learning Weights",
  "Adaptive orchestration bias layer",
  "Weights API",
  "Posture",
  "Stability Bias",
  "Expansion Bias",
  "Verification Bias",
  "Telemetry Bias",
  "learning-weights-summary-panel"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Learning weights summary preview guard failed"
}

Write-Host "LEARNING WEIGHTS SUMMARY PREVIEW GUARD PASSED"
