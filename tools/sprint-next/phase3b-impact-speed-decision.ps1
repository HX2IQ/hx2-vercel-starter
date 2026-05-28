$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B IMPACT SPEED DECISION =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  Write-Host "No audit directory found. Speed decision unavailable."
  exit 0
}

$Latest = Get-ChildItem $AuditDir -Filter "phase3b-impact-scan-*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  Write-Host "No impact scan audit found. Speed decision unavailable."
  exit 0
}

$Impact = Get-Content $Latest.FullName -Raw | ConvertFrom-Json

$Decision = "full_validation_required"
$Reason = "default_safety"

if ($Impact.risk_level -eq "low") {
  $Decision = "candidate_for_cached_validation"
  $Reason = "low_risk_impact"
} elseif ($Impact.risk_level -eq "medium") {
  $Decision = "candidate_for_targeted_validation_after_more_calibration"
  $Reason = "medium_risk_probe_or_guard_change"
} elseif ($Impact.risk_level -eq "high") {
  $Decision = "full_validation_required"
  $Reason = "high_risk_core_or_route_change"
}

Write-Host "Impact audit: $($Latest.Name)"
Write-Host "Risk level: $($Impact.risk_level)"
Write-Host "Speed decision: $Decision"
Write-Host "Reason: $Reason"
Write-Host "Validation skipped: false"
Write-Host "Advisory only: true"
