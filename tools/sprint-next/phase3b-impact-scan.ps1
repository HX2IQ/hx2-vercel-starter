$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B IMPACT SCAN =="

$AuditDir = "tools/sprint-next/_audit"
New-Item -ItemType Directory -Force -Path $AuditDir | Out-Null

$ChangedFiles = git diff --name-only HEAD

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

if (-not $ChangedFiles) {
  Write-Host "No uncommitted changes detected."
}

$HighRiskCount = @($Areas.compiler + $Areas.graph + $Areas.routes + $Areas.build_process).Count
$MediumRiskCount = @($Areas.probes + $Areas.guards).Count

$RiskLevel = "low"
if ($HighRiskCount -gt 0) {
  $RiskLevel = "high"
} elseif ($MediumRiskCount -gt 0) {
  $RiskLevel = "medium"
}

$Impact = [ordered]@{
  audit_id = "phase3b-impact-scan"
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  changed_file_count = @($ChangedFiles).Count
  advisory_only = $true
  validation_skipped = $false
  risk_level = $RiskLevel
  high_risk_count = $HighRiskCount
  medium_risk_count = $MediumRiskCount
  areas = $Areas
}

$ImpactPathOut = Join-Path $AuditDir ("phase3b-impact-scan-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$Impact | ConvertTo-Json -Depth 10 | Set-Content $ImpactPathOut -Encoding UTF8

Write-Host ""
Write-Host "Impact audit written: $ImpactPathOut"
Write-Host "Impact scan is advisory only. No validation is skipped."

