$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST AUDIT =="

$AuditDir = "tools/sprint-next/_audit"

if (!(Test-Path $AuditDir)) {
  throw "Audit directory not found: $AuditDir"
}

$Latest = Get-ChildItem $AuditDir -Filter "*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Latest) {
  throw "No audit JSON files found in $AuditDir"
}

Write-Host "Latest audit file: $($Latest.FullName)"
Get-Content $Latest.FullName -Raw | ConvertFrom-Json | ConvertTo-Json -Depth 10
