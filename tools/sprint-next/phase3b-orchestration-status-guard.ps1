$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B ORCHESTRATION STATUS GUARD =="

$StatusPath = "app/api/hx2/_lib/phase3b-orchestration-status.ts"
$RoutePath = "app/api/hx2/phase3b-orchestration-status/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($StatusPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Status = Get-Content $StatusPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getPhase3BOrchestrationStatusSnapshot",
  "phase_3b",
  "read_only_snapshot",
  "composition_mutation_allowed: false",
  "phase3b_ready",
  "compiler",
  "dependencies",
  "graph",
  "execution_plan",
  "blocking_reasons"
)

foreach ($Term in $RequiredTerms) {
  if ($Status -notmatch [regex]::Escape($Term)) {
    throw "Phase 3B status missing required term: $Term"
  }
}

if ($Status -match "sprint-next-composition") {
  throw "Phase 3B status must not import sprint-next-composition"
}

if ($Composition -match "phase3b-orchestration-status") {
  throw "Composition must not directly reference Phase 3B status during preview phase"
}

if ($Route -notmatch "/api/hx2/phase3b-orchestration-status") {
  throw "Phase 3B status route missing canonical route marker"
}

Write-Host "PHASE 3B ORCHESTRATION STATUS GUARD PASSED"
