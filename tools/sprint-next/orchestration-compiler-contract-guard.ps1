$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION COMPILER CONTRACT GUARD =="

$CompilerPath = "app/api/hx2/_lib/orchestration-compiler.ts"
$RoutePath = "app/api/hx2/orchestration-compiler/route.ts"

if (!(Test-Path $CompilerPath)) { throw "Missing compiler helper: $CompilerPath" }
if (!(Test-Path $RoutePath)) { throw "Missing compiler route: $RoutePath" }

$Compiler = Get-Content $CompilerPath -Raw
$Route = Get-Content $RoutePath -Raw

$RequiredSnapshotFields = @(
  "compiler_id",
  "compiler_phase",
  "compiler_mode",
  "composition_mutation_allowed",
  "stage_count",
  "ordered_stages",
  "registry_integrity",
  "registry_validation",
  "lineage_integrity",
  "dependency_validation",
  "readiness",
  "compiler_ready",
  "blocking_reasons"
)

foreach ($Field in $RequiredSnapshotFields) {
  if ($Compiler -notmatch [regex]::Escape($Field)) {
    throw "Compiler snapshot missing required field: $Field"
  }
}

$RequiredStageFields = @(
  "stage_id",
  "stage_type",
  "helper",
  "order",
  "depends_on"
)

foreach ($Field in $RequiredStageFields) {
  if ($Compiler -notmatch [regex]::Escape($Field)) {
    throw "Compiler stage contract missing field: $Field"
  }
}

if ($Compiler -match "sprint-next-composition") {
  throw "Compiler contract violation: compiler must not reference sprint-next-composition"
}

if ($Route -notmatch "getOrchestrationCompilerSnapshot") {
  throw "Compiler route must call getOrchestrationCompilerSnapshot"
}

if ($Route -match "ok:\s*true[\s\S]*\.\.\.snapshot") {
  throw "Compiler route has overwrite-prone duplicate ok before snapshot spread"
}

Write-Host "ORCHESTRATION COMPILER CONTRACT GUARD PASSED"
