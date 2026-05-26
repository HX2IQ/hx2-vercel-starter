$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B RELEASE MANIFEST GUARD =="

$ManifestPath = "app/api/hx2/_lib/phase3b-release-manifest.ts"
$RoutePath = "app/api/hx2/phase3b-release-manifest/route.ts"
$CompositionPath = "app/api/hx2/_lib/sprint-next-composition.ts"

foreach ($Path in @($ManifestPath, $RoutePath, $CompositionPath)) {
  if (!(Test-Path $Path)) {
    throw "Missing required file: $Path"
  }
}

$Manifest = Get-Content $ManifestPath -Raw
$Route = Get-Content $RoutePath -Raw
$Composition = Get-Content $CompositionPath -Raw

$RequiredTerms = @(
  "getPhase3BReleaseManifest",
  "hx2-phase3b-release-manifest",
  "deterministic_orchestration_preview",
  "composition_mutation_allowed: false",
  "status_route",
  "compiler_route",
  "dependency_route",
  "graph_route",
  "execution_plan_route"
)

foreach ($Term in $RequiredTerms) {
  if ($Manifest -notmatch [regex]::Escape($Term)) {
    throw "Release manifest missing required term: $Term"
  }
}

if ($Manifest -match "sprint-next-composition") {
  throw "Release manifest must not import sprint-next-composition"
}

if ($Composition -match "phase3b-release-manifest") {
  throw "Composition must not reference release manifest during preview phase"
}

if ($Route -notmatch "/api/hx2/phase3b-release-manifest") {
  throw "Release manifest route missing canonical route marker"
}

Write-Host "PHASE 3B RELEASE MANIFEST GUARD PASSED"
