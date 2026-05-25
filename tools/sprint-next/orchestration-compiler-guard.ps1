$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION COMPILER GUARD =="

$RequiredFiles = @(
  "app/api/hx2/_lib/orchestration-compiler.ts",
  "app/api/hx2/orchestration-compiler/route.ts"
)

foreach ($file in $RequiredFiles) {
  if (!(Test-Path $file)) {
    throw "Missing required file: $file"
  }
}

$compiler = Get-Content "app/api/hx2/_lib/orchestration-compiler.ts" -Raw
$route = Get-Content "app/api/hx2/orchestration-compiler/route.ts" -Raw

$RequiredCompilerTerms = @(
  "getOrchestrationCompilerSnapshot",
  "composition_mutation_allowed: false",
  "phase_3b_foundation",
  "read_only_preview",
  "compiler_ready",
  "blocking_reasons"
)

foreach ($term in $RequiredCompilerTerms) {
  if ($compiler -notmatch [regex]::Escape($term)) {
    throw "Compiler missing required term: $term"
  }
}

if ($route -notmatch "getOrchestrationCompilerSnapshot") {
  throw "Route does not call compiler snapshot helper"
}

if ($route -notmatch "/api/hx2/orchestration-compiler") {
  throw "Route missing canonical route marker"
}

Write-Host "ORCHESTRATION COMPILER GUARD PASSED"
