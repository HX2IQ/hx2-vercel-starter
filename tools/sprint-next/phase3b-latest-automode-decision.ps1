$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST AUTOMODE DECISION =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  Write-Host "No audit directory found."
  exit 0
}

$Latest = Get-ChildItem $AuditDir -Filter "phase3b-automode-decision-*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  Write-Host "No AutoMode decision audit found."
  exit 0
}

$Decision = Get-Content $Latest.FullName -Raw | ConvertFrom-Json

Write-Host "File: $($Latest.Name)"
Write-Host "Generated UTC: $($Decision.generated_at_utc)"
Write-Host "Feature: $($Decision.feature_name)"
Write-Host "Message: $($Decision.message)"
Write-Host "Risk level: $($Decision.risk_level)"
Write-Host "Changed files: $($Decision.changed_file_count)"
Write-Host "Execution mode: $($Decision.execution_mode)"
Write-Host "Deploy skipped: $($Decision.deploy_skipped)"
Write-Host "Decision reason: $($Decision.decision_reason)"
Write-Host "Optimization mode: $($Decision.optimization_mode)"
Write-Host "Adaptive score: $($Decision.adaptive_score)"
