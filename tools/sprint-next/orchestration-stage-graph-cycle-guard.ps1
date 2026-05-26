$ErrorActionPreference = "Stop"

Write-Host "`n== ORCHESTRATION STAGE GRAPH CYCLE GUARD =="

$GraphPath = "app/api/hx2/_lib/orchestration-stage-graph.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($GraphPath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Graph = Get-Content $GraphPath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "detectGraphCycles",
  "cycle_validation",
  "cycle_count",
  "cycles",
  "visiting",
  "visited"
)

foreach ($Term in $RequiredTerms) {
  if ($Graph -notmatch [regex]::Escape($Term)) {
    throw "Stage graph cycle validation missing term: $Term"
  }
}

if ($Graph -match "sprint-next-composition") {
  throw "Stage graph must not import sprint-next-composition"
}

if ($Composition -match "detectGraphCycles") {
  throw "Composition must not contain graph cycle logic"
}

Write-Host "ORCHESTRATION STAGE GRAPH CYCLE GUARD PASSED"
