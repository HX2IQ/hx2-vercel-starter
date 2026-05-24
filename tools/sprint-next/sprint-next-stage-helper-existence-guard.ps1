$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT STAGE HELPER EXISTENCE GUARD =="

$files = @(
  "app/api/hx2/_lib/sprint-next-composition.ts",
  "app/api/hx2/_lib/sprint-next-learning-telemetry-stage.ts",
  "app/api/hx2/_lib/sprint-next-decision-stage.ts",
  "app/api/hx2/_lib/adaptive-orchestration-restraint.ts",
  "app/api/hx2/_lib/adaptive-restraint-package-modifier.ts",
  "app/api/hx2/_lib/orchestration-confidence-decay.ts"
)

$missing = @()

foreach ($file in $files) {
  if (!(Test-Path $file)) {
    $missing += "Missing stage helper: $file"
  }
}

$composition = Get-Content "app/api/hx2/_lib/sprint-next-composition.ts" -Raw

$requiredImports = @(
  "sprint-next-learning-telemetry-stage",
  "sprint-next-decision-stage",
  "adaptive-orchestration-restraint",
  "adaptive-restraint-package-modifier",
  "orchestration-confidence-decay"
)

foreach ($needle in $requiredImports) {
  if ($composition -notlike "*$needle*") {
    $missing += "Composition missing import path: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint Next stage helper existence guard failed"
}

Write-Host "SPRINT NEXT STAGE HELPER EXISTENCE GUARD PASSED"
