$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST IMPACT REPORT =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  Write-Host "No audit directory found."
  exit 0
}

$Latest = Get-ChildItem $AuditDir -Filter "phase3b-impact-scan-*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  Write-Host "No impact scan audit found."
  exit 0
}

$Impact = Get-Content $Latest.FullName -Raw | ConvertFrom-Json

Write-Host "File: $($Latest.Name)"
Write-Host "Generated UTC: $($Impact.generated_at_utc)"
Write-Host "Changed file count: $($Impact.changed_file_count)"
Write-Host "Advisory only: $($Impact.advisory_only)"
Write-Host "Validation skipped: $($Impact.validation_skipped)"

foreach ($Area in $Impact.areas.PSObject.Properties) {
  if ($Area.Value.Count -gt 0) {
    Write-Host ""
    Write-Host "Area: $($Area.Name)"
    $Area.Value | ForEach-Object { Write-Host "- $_" }
  }
}
