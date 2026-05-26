$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION STAGE REGISTRY GUARD =="

$registry = "app/api/hx2/_lib/sprint-next-stage-registry.ts"
$composition = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($path in @($registry, $composition)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$registryText = Get-Content $registry -Raw
$compositionText = Get-Content $composition -Raw

$requiredRegistry = @(
  "SprintNextStageDefinition",
  "sprintNextStageRegistry",
  "learning-telemetry",
  "recursive-verification",
  "verification-escalation",
  "verification-synthesis",
  "adaptive-restraint",
  "decision-stage"
)

$requiredComposition = @(
  "sprintNextStageRegistry",
  "orchestration_stage_registry"
)

$missing = @()

foreach ($needle in $requiredRegistry) {
  if ($registryText -notlike "*$needle*") {
    $missing += "Missing in registry: $needle"
  }
}

foreach ($needle in $requiredComposition) {
  if ($compositionText -notlike "*$needle*") {
    $missing += "Missing in composition: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration stage registry guard failed"
}

Write-Host "ORCHESTRATION STAGE REGISTRY GUARD PASSED"
