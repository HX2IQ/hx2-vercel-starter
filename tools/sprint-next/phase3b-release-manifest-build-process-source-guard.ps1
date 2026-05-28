$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B RELEASE MANIFEST BUILD PROCESS SOURCE GUARD =="

$ManifestPath = "app/api/hx2/_lib/phase3b-release-manifest.ts"

if (!(Test-Path $ManifestPath)) {
  throw "Missing release manifest helper: $ManifestPath"
}

$Manifest = Get-Content $ManifestPath -Raw

$RequiredTerms = @(
  "getPhase3BBuildProcessVersion",
  "const buildProcess = getPhase3BBuildProcessVersion();",
  "build_process:",
  "process_mode: buildProcess.process_mode",
  "process_version: buildProcess.process_version",
  "release_notes: buildProcess.release_notes"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Manifest.Contains($Term)) {
    throw "Release manifest missing build_process source term: $Term"
  }
}

Write-Host "PHASE 3B RELEASE MANIFEST BUILD PROCESS SOURCE GUARD PASSED"
