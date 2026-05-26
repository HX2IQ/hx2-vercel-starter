$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION STAGE MANIFEST PREVIEW GUARD =="

$panel = "app/owner-console/_components/orchestration-stage-manifest-panel.tsx"
$mount = "app/owner-console/_components/chat-master-panels.tsx"

foreach ($path in @($panel, $mount)) {
  if (!(Test-Path $path)) {
    throw "Missing required UI file: $path"
  }
}

$combined = (Get-Content $panel -Raw) + "`n" + (Get-Content $mount -Raw)

$required = @(
  "OrchestrationStageManifestPanel",
  "Orchestration Stage Manifest",
  "Phase 3 deterministic orchestration stage registry health",
  "Manifest API",
  "Stage Count",
  "Registry OK",
  "Validation",
  "Registered Stages",
  "orchestration-stage-manifest-panel"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration stage manifest preview guard failed"
}

Write-Host "ORCHESTRATION STAGE MANIFEST PREVIEW GUARD PASSED"
