$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST PRODUCTION VERIFY SUMMARY =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  Write-Host "No audit directory found."
  exit 0
}

$Latest = Get-ChildItem $AuditDir -Filter "phase3b-master-production-verify-*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  Write-Host "No production verify audit found."
  exit 0
}

$Audit = Get-Content $Latest.FullName -Raw | ConvertFrom-Json

Write-Host "File: $($Latest.Name)"
Write-Host "Started UTC: $($Audit.started_at_utc)"
Write-Host "Completed UTC: $($Audit.completed_at_utc)"
Write-Host "Duration seconds: $($Audit.duration_seconds)"
Write-Host "Mode: $($Audit.mode)"
Write-Host "Probe count: $($Audit.probe_count)"
Write-Host "Result: $($Audit.result)"

if ($Audit.PSObject.Properties.Name -contains "slowest_probes") {
  Write-Host ""
  Write-Host "== SLOWEST PROBES =="

  foreach ($Probe in $Audit.slowest_probes) {
    Write-Host "- $($Probe.probe)"
    Write-Host "  Result: $($Probe.result)"
    Write-Host "  Duration seconds: $($Probe.duration_seconds)"
  }
}

Write-Host ""
Write-Host "Validation skipped: false"
Write-Host "Advisory speed layer only."
