$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST TIMING REPORT =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  throw "Audit directory not found: $AuditDir"
}

$LatestAudits = Get-ChildItem $AuditDir -Filter "*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 5

if ($LatestAudits.Count -eq 0) {
  throw "No audit files found in $AuditDir"
}

foreach ($Audit in $LatestAudits) {
  $Json = Get-Content $Audit.FullName -Raw | ConvertFrom-Json

  Write-Host ""
  Write-Host "File: $($Audit.Name)"
  Write-Host "Audit ID: $($Json.audit_id)"
  Write-Host "Mode: $($Json.mode)"
  Write-Host "Result: $($Json.result)"
  Write-Host "Started: $($Json.started_at_utc)"
  Write-Host "Completed: $($Json.completed_at_utc)"

  if ($Json.PSObject.Properties.Name -contains "duration_seconds") {
    Write-Host "Duration seconds: $($Json.duration_seconds)"
  } else {
    Write-Host "Duration seconds: not recorded"
  }

  if ($Json.PSObject.Properties.Name -contains "probe_count") {
    Write-Host "Probe count: $($Json.probe_count)"
  }
}
