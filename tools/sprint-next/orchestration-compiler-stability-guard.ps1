$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION COMPILER STABILITY GUARD =="

$CompilerPath = "app/api/hx2/_lib/orchestration-compiler.ts"
$RoutePath = "app/api/hx2/orchestration-compiler/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($CompilerPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Compiler = Get-Content $CompilerPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

if ($Compiler -notmatch "composition_mutation_allowed:\s*false") {
  throw "Compiler must explicitly declare composition_mutation_allowed: false"
}

if ($Compiler -notmatch "read_only_preview") {
  throw "Compiler must remain read_only_preview"
}

if ($Compiler -match 'from "\./sprint-next-composition"') {
  throw "Compiler must not import sprint-next-composition"
}

if ($Route -match "ok:\s*true[\s\S]*\.\.\.snapshot") {
  throw "Route has duplicate/overwrite-prone ok before snapshot spread"
}

if ($Route -notmatch "\.\.\.snapshot") {
  throw "Route must return compiler snapshot"
}

if ($Route -notmatch "/api/hx2/orchestration-compiler") {
  throw "Route missing canonical route marker"
}

if ($Composition -match "getOrchestrationCompilerSnapshot") {
  throw "Composition must not call compiler snapshot during Phase 3B foundation"
}

Write-Host "ORCHESTRATION COMPILER STABILITY GUARD PASSED"
