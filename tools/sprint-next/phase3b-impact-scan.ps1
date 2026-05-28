$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B IMPACT SCAN =="

$ChangedFiles = git diff --name-only HEAD

if (-not $ChangedFiles) {
  Write-Host "No uncommitted changes detected."
  exit 0
}

$Areas = [ordered]@{
  compiler = @()
  graph = @()
  routes = @()
  probes = @()
  guards = @()
  build_process = @()
  ui = @()
  other = @()
}

foreach ($File in $ChangedFiles) {
  if ($File -match "orchestration-compiler") { $Areas.compiler += $File; continue }
  if ($File -match "orchestration-stage-graph|orchestration-execution-plan|orchestration-stage-dependencies") { $Areas.graph += $File; continue }
  if ($File -match "app/api/hx2/.*/route\.ts") { $Areas.routes += $File; continue }
  if ($File -match "production-probe\.ps1") { $Areas.probes += $File; continue }
  if ($File -match "guard\.ps1") { $Areas.guards += $File; continue }
  if ($File -match "phase3b-fast-safe-sprint|sprint-next\.ps1|phase3b-master-production-verify|phase3b-build-process") { $Areas.build_process += $File; continue }
  if ($File -match "app/owner-console|app/chat|components") { $Areas.ui += $File; continue }
  $Areas.other += $File
}

foreach ($Area in $Areas.Keys) {
  if ($Areas[$Area].Count -gt 0) {
    Write-Host ""
    Write-Host "Area: $Area"
    $Areas[$Area] | ForEach-Object { Write-Host "- $_" }
  }
}

Write-Host ""
Write-Host "Impact scan is advisory only. No validation is skipped."
