$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B SPRINT SNAPSHOT GUARD =="

$SnapshotPath = "app/api/hx2/_lib/phase3b-sprint-snapshot.ts"
$RoutePath = "app/api/hx2/phase3b-sprint-snapshot/route.ts"

foreach ($Path in @($SnapshotPath, $RoutePath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Snapshot = Get-Content $SnapshotPath -Raw
$Route = Get-Content $RoutePath -Raw

$RequiredTerms = @(
  "getPhase3BSprintSnapshot",
  "hx2-phase3b-sprint-snapshot",
  "read_only_sprint_snapshot",
  "route_contracts",
  "orchestration",
  "planned_stage_count",
  "build_health",
  "build_process_version"
)

foreach ($Term in $RequiredTerms) {
  if ($Snapshot -notmatch [regex]::Escape($Term)) {
    throw "Sprint snapshot missing required term: $Term"
  }
}

if ($Route -notmatch "/api/hx2/phase3b-sprint-snapshot") {
  throw "Sprint snapshot route missing canonical marker"
}

Write-Host "PHASE 3B SPRINT SNAPSHOT GUARD PASSED"


