$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION STAGE DEPENDENCY REGISTRY GUARD =="

$RegistryPath = "app/api/hx2/_lib/orchestration-stage-dependency-registry.ts"
$RoutePath = "app/api/hx2/orchestration-stage-dependencies/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($RegistryPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Registry = Get-Content $RegistryPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getOrchestrationStageDependencyRegistry",
  "validateStageDependencies",
  "missing_dependencies",
  "circular_self_dependencies",
  "dependency_stage_count"
)

foreach ($Term in $RequiredTerms) {
  if ($Registry -notmatch [regex]::Escape($Term)) {
    throw "Dependency registry missing required term: $Term"
  }
}

if ($Registry -match "sprint-next-composition") {
  throw "Dependency registry must not import sprint-next-composition"
}

if ($Composition -match "orchestration-stage-dependency-registry") {
  throw "Composition must not directly reference dependency registry during Phase 3B"
}

if ($Route -notmatch "/api/hx2/orchestration-stage-dependencies") {
  throw "Dependency route missing canonical route marker"
}

Write-Host "ORCHESTRATION STAGE DEPENDENCY REGISTRY GUARD PASSED"
