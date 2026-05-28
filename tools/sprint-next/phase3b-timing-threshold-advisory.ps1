param(
  [int]$WarnAboveSeconds = 900
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B TIMING THRESHOLD ADVISORY =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  Write-Host "No audit directory found. Skipping timing advisory."
  exit 0
}

$Latest = Get-ChildItem $AuditDir -Filter "*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  Write-Host "No audit files found. Skipping timing advisory."
  exit 0
}

$Json = Get-Content $Latest.FullName -Raw | ConvertFrom-Json

if (-not ($Json.PSObject.Properties.Name -contains "duration_seconds")) {
  Write-Host "Latest audit has no duration_seconds. Skipping timing advisory."
  exit 0
}

Write-Host "Latest audit: $($Latest.Name)"
Write-Host "Duration seconds: $($Json.duration_seconds)"
Write-Host "Warning threshold seconds: $WarnAboveSeconds"

if ([double]$Json.duration_seconds -gt $WarnAboveSeconds) {
  Write-Host "ADVISORY: Latest Phase 3B run exceeded timing threshold. Consider incremental/cached validation next."
} else {
  Write-Host "Timing advisory passed."
}
