$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST SPEED DECISION =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  Write-Host "No audit directory found."
  exit 0
}

$Latest = Get-ChildItem $AuditDir -Filter "phase3b-impact-speed-decision-*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  Write-Host "No speed decision audit found."
  exit 0
}

$Decision = Get-Content $Latest.FullName -Raw | ConvertFrom-Json

Write-Host "File: $($Latest.Name)"
Write-Host "Generated UTC: $($Decision.generated_at_utc)"
Write-Host "Source impact audit: $($Decision.source_impact_audit)"
Write-Host "Risk level: $($Decision.risk_level)"
Write-Host "Speed decision: $($Decision.speed_decision)"
Write-Host "Reason: $($Decision.reason)"
Write-Host "Validation skipped: $($Decision.validation_skipped)"
Write-Host "Advisory only: $($Decision.advisory_only)"
