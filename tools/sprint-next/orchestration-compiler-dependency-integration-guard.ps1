$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION COMPILER DEPENDENCY INTEGRATION GUARD =="

$CompilerPath = "app/api/hx2/_lib/orchestration-compiler.ts"
$DependencyRegistryPath = "app/api/hx2/_lib/orchestration-stage-dependency-registry.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($CompilerPath, $DependencyRegistryPath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Compiler = Get-Content $CompilerPath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getOrchestrationStageDependencyRegistry",
  "validateStageDependencies",
  "dependency_registry",
  "dependencyRegistryValidation",
  "stage_dependency_registry_validation_failed"
)

foreach ($Term in $RequiredTerms) {
  if ($Compiler -notmatch [regex]::Escape($Term)) {
    throw "Compiler missing dependency integration term: $Term"
  }
}

if ($Compiler -match 'from "\./sprint-next-composition"') {
  throw "Compiler must not import sprint-next-composition"
}

if ($Composition -match "orchestration-stage-dependency-registry") {
  throw "Composition must not directly reference dependency registry during Phase 3B"
}

Write-Host "ORCHESTRATION COMPILER DEPENDENCY INTEGRATION GUARD PASSED"
